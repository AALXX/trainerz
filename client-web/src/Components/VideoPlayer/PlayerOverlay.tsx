import React, { Dispatch, RefObject, SetStateAction } from 'react'
import { changeVolume } from '@/Components/VideoPlayer/UtilFunc'

interface IOverlayProps {
    VideoRef: RefObject<HTMLVideoElement>
    Progress: number
    Playing: boolean
    CurrentMinutes: number
    CurrentSeconds: number
    DurationMinutes: number
    DurationSeconds: number
    Volume: number
    playOrPauseVideo: any
    setPlaying: Dispatch<SetStateAction<boolean>>
    setVolume: Dispatch<SetStateAction<number>>
    setShowOverlay: Dispatch<SetStateAction<boolean>>
    handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Video player overlay
 * @param {OverlayProps} props
 * @return {JSX}
 */
const PlayerOverlay = (props: IOverlayProps) => {
    return (
        <div
            className="absolute flex h-[71.4vh] w-[66.8vw]"
            onMouseEnter={() => {
                props.setShowOverlay(true)
            }}
            onMouseLeave={() => {
                props.setShowOverlay(false)
            }}
        >
            <div className="z-10 flex h-[8%] w-full flex-col self-end bg-[#00000041]">
                <input type="range" className="h-[.5rem] w-full appearance-none" min="0" max="100" step="0.01" value={props.Progress} onChange={props.handleProgressChange} />
                <div className="flex h-full">
                    {props.Playing ? (
                        <img
                            src="/assets/PlayerIcons/Puase_icon.svg"
                            className="ml-[1rem] w-[2rem] cursor-pointer"
                            alt="playing Image"
                            onClick={() => {
                                props.setPlaying(props.playOrPauseVideo(props.VideoRef))
                            }}
                        />
                    ) : (
                        <img
                            src="/assets/PlayerIcons/Play_icon.svg"
                            className="ml-[1rem] w-[2rem] cursor-pointer"
                            alt="playing Image"
                            onClick={() => {
                                props.playOrPauseVideo(props.VideoRef)
                            }}
                        />
                    )}
                    <img
                        src="/assets/PlayerIcons/Next_icon.svg"
                        className="ml-[1rem] w-[2rem] cursor-pointer"
                        alt="playing Image"
                        onClick={() => {
                            // PlayOrPauseVideo()
                        }}
                    />

                    <div className="ml-8 flex">
                        {props.Volume == 0 ? (
                            <img
                                src="/assets/PlayerIcons/VolumeOff_icon.svg"
                                className="mr-[1rem] w-[1.6rem] cursor-pointer"
                                alt="not muted image"
                                onClick={() => {
                                    props.setVolume(0.5)
                                    props.VideoRef!.current!.volume = 1
                                    localStorage.setItem('Volume', String(1))
                                }}
                            />
                        ) : (
                            <img
                                src="/assets/PlayerIcons/MaxVolume_icon.svg"
                                className="mr-[1rem] w-[1.6rem] cursor-pointer"
                                alt="muted imgage"
                                onClick={() => {
                                    props.setVolume(0)
                                    props.VideoRef!.current!.volume = 0
                                    localStorage.setItem('Volume', String(0))
                                }}
                            />
                        )}

                        <input
                            type="range"
                            className="h-[.5rem] w-[100%] appearance-none self-center bg-[#707070] focus:outline-none"
                            min="0"
                            max="1"
                            step="0.01"
                            onChange={e => {
                                props.setVolume(changeVolume(props.VideoRef, e))
                            }}
                            value={props.Volume}
                        />
                    </div>

                    <h1 className="ml-11 self-center text-white">
                        <span>
                            {props.CurrentMinutes}:{props.CurrentSeconds < 10 ? '0' + props.CurrentSeconds : props.CurrentSeconds}
                        </span>{' '}
                        /{' '}
                        <span>
                            {props.DurationMinutes}:{props.DurationSeconds}
                        </span>
                    </h1>

                    <img
                        src="/assets/PlayerIcons/Fullscreen_icon.svg"
                        className="ml-auto mr-[1rem] w-[1.6rem] cursor-pointer"
                        alt=" fullsScreen image"
                        onClick={() => {
                            props.VideoRef?.current?.requestFullscreen()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default PlayerOverlay
