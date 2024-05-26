package platform.api.videostreamapi.domain;

import java.sql.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "videos")
public class VideoData {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private String VideoTitle;
    private String OwnerToken;
    private Date PublishDate;

    public String getVideoTitle() {
        return VideoTitle;
    }

    public void setVideoTitle(String DBVideoTitle) {

        VideoTitle = DBVideoTitle;
    }

    public String getOwnerToken() {
        return OwnerToken;
    }

    public void setOwnerToken(String DBOwnerToken) {

        OwnerToken = DBOwnerToken;
    }

    public Date getPublishDate() {
        return PublishDate;
    }

    public void setPublishDate(Date DBPublishDate) {
        PublishDate = DBPublishDate;
    }

}
