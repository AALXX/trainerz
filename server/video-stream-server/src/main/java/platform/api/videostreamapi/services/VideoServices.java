package platform.api.videostreamapi.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import platform.api.videostreamapi.domain.VideoData;

import reactor.core.publisher.Mono;

@Service
public class VideoServices implements IVideoServices {

    private static final String VideoPathFormat = "file:../accounts/%s/%s/Source.mp4";

    // * it loads video from file system
    @Autowired
    public ResourceLoader VideoLoader;

    public Mono<Resource> GetVideo(String OwnerToken, String VideoToken) {

        return Mono.fromSupplier(
                () -> VideoLoader.getResource(String.format(VideoPathFormat, OwnerToken, VideoToken)));
        // return null;
    }


    @Autowired
    private JdbcTemplate jdbcTemplate;

    // * Get video Data from the database
    @Override
    public List<VideoData> GetVideoData(String VideoToken) {

        String sql = "SELECT * FROM videos WHERE VideoToken = '" + VideoToken + "'";

        List<VideoData> data = jdbcTemplate.query(sql, new BeanPropertyRowMapper<VideoData>(VideoData.class));

        return data;
    }

}
