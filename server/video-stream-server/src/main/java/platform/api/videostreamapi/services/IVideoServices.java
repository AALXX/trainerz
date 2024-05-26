package platform.api.videostreamapi.services;

import java.util.List;

import platform.api.videostreamapi.domain.VideoData;

public interface IVideoServices {
    List<VideoData> GetVideoData(String VideoToken);
}
