package platform.api.videostreamapi.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;

import platform.api.videostreamapi.domain.VideoData;
import platform.api.videostreamapi.services.VideoServices;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/video-manager")
public class VideoStreamApiRoutes {

    private VideoServices videoServices;

    public VideoStreamApiRoutes(VideoServices videoServices) {
        this.videoServices = videoServices;
    }

    @GetMapping(value = "video-stream/{VideoToken}", produces = "video/mp4")
    public Mono<Resource> GetVideo(@PathVariable String VideoToken) {

        List<VideoData> data = videoServices.GetVideoData(VideoToken);
        if (!data.isEmpty()) {

            return videoServices.GetVideo(data.get(0).getOwnerToken(), VideoToken);
        }
        return null;
    }
}
