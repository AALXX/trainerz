package platform.api.videostreamapi.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    private static final Path BASE_PATH = Paths.get("..", "accounts");

    // * it loads video from file system
    @Autowired
    public ResourceLoader VideoLoader;

    public Mono<Resource> GetVideo(String ownerToken, String videoToken) {

        return Mono.defer(() -> {
            Path videoPath = BASE_PATH.resolve(Paths.get(ownerToken, videoToken, "Source.mp4"));
            Resource resource = VideoLoader.getResource("file:" + videoPath.toString());
            if (resource.exists()) {
                return Mono.just(resource);
            } else {
                return Mono.error(new IOException("Video not found"));
            }
        });
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
