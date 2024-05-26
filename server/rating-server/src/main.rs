use mysql::*;
use mysql::prelude::*;
use dotenv::dotenv;
use std::env;
use tokio::task;
use tokio::time::{sleep, Duration};
use tokio::time;

#[derive(Debug, PartialEq, Eq, Clone)]
struct UserViews {
    owner_token: String,
    total_views: i64,
}

#[derive(Debug, PartialEq, Eq)]
struct UserRating {
    user_token: String,
    account_views: i64,
    rating: i32,
}

async fn fetch_users_views(pool: &Pool) -> Vec<UserViews> {
    // Acquire connection from the pool
    let mut conn = pool.get_conn().unwrap();

    // Execute a query asynchronously to get the total views per user
    let query = "SELECT ownerToken, SUM(views) as total_views FROM videos GROUP BY ownerToken;";
    task::spawn_blocking(move || {
        conn.query_map(query, |(owner_token, total_views)| {
            UserViews {
                owner_token,
                total_views,
            }
        }).unwrap()
    }).await.unwrap()
}

async fn analyze_and_insert_ratings(
    pool: &Pool,
    user_views: Vec<UserViews>
) -> Result<(), Box<dyn std::error::Error>> {
    // Sort the users by total views in descending order
    let mut user_views = user_views;
    user_views.sort_by(|a, b| b.total_views.cmp(&a.total_views));

    // Calculate ratings based on ranks
    let total_users = user_views.len();
    let mut user_ratings = Vec::new();

    // Calculate thresholds for each rating category
    let threshold_5 = ((total_users as f64) * 0.2).ceil() as usize;
    let threshold_4 = ((total_users as f64) * 0.4).ceil() as usize;
    let threshold_3 = ((total_users as f64) * 0.6).ceil() as usize;
    let threshold_2 = ((total_users as f64) * 0.8).ceil() as usize;

    for (index, user_view) in user_views.iter().enumerate() {
        let rank = index + 1; // Adding 1 to the index to start from 1

        let rating = if rank <= threshold_5 {
            5
        } else if rank <= threshold_4 {
            4
        } else if rank <= threshold_3 {
            3
        } else if rank <= threshold_2 {
            2
        } else {
            1
        };

        user_ratings.push(UserRating {
            user_token: user_view.owner_token.clone(),
            account_views: user_view.total_views,
            rating,
        });
    }

    // Insert user ratings into the ratings table
    let mut conn = pool.get_conn().unwrap();
    let insert_query = "INSERT INTO ratings (UserToken, AccountViews, Rating)
                    VALUES (:user_token, :account_views, :rating)
                    ON DUPLICATE KEY UPDATE
                    AccountViews = VALUES(AccountViews),
                    Rating = VALUES(Rating)";

    for user_rating in user_ratings {
        conn.exec_drop(
            insert_query,
            params! {
            "user_token" => &user_rating.user_token,
            "account_views" => user_rating.account_views,
            "rating" => user_rating.rating,
        }
        )?;
    }

    Ok(())
}

#[tokio::main]
async fn main() {
    dotenv().ok(); // Load environment variables from .env file

    // Fetch MySQL credentials from environment variables
    let db_url = format!(
        "mysql://{}:{}@{}:{}/{}",
        env::var("MYSQL_USERNAME").unwrap(),
        env::var("MYSQL_PASSWORD").unwrap(),
        env::var("MYSQL_HOST").unwrap(),
        env::var("MYSQL_PORT").unwrap(),
        env::var("MYSQL_DATABASE").unwrap()
    );

    // Create MySQL connection options
    let opts = Opts::from_url(&db_url).unwrap();
    let pool = Pool::new(opts).unwrap();
    loop {
        // Fetch videos
        let user_views = fetch_users_views(&pool).await;
        println!("{:?}", user_views);

        // Analyze and insert ratings
        if let Err(e) = analyze_and_insert_ratings(&pool, user_views.clone()).await {
            eprintln!("Failed to analyze and insert ratings: {}", e);
        } else {
            println!("Ratings successfully inserted!");
        }

        // Sleep for 1 hour before next iteration
        time::sleep(Duration::from_secs(3600)).await;
    }
}
