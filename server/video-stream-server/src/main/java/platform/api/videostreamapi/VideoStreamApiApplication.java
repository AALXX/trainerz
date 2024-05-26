package platform.api.videostreamapi;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VideoStreamApiApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(VideoStreamApiApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("Server running on http://172.31.5.46:7500/");
	}

}
