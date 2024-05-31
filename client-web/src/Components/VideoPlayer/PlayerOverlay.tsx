import React, { Dispatch, RefObject, SetStateAction } from 'react'
import { changeVolume } from '@/Components/VideoPLayer/UtilFunc'

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
}

/**
 * Video player overlay
 * @param {OverlayProps} props
 * @return {JSX}
 */
export default function PlayerOverlay(props: IOverlayProps) {
    return (
        <div
            className="flex  absolute w-[66.8vw] h-[71.4vh] "
            onMouseEnter={() => {
                props.setShowOverlay(true)
            }}
            onMouseLeave={() => {
                props.setShowOverlay(false)
            }}
        >
            <div className="flex flex-col  w-full h-[8%] bg-[#00000041] z-10 self-end">
                <div className="bg-red-800 h-[.3rem]" style={{ width: `${props.Progress}%` }} />
                <div className="flex h-full">
                    {props.Playing ? (
                        <img
                            src="/assets/PlayerIcons/Puase_icon.svg"
                            className=" cursor-pointer w-[2rem]  ml-[1rem]"
                            alt="playing Image"
                            onClick={() => {
                                props.setPlaying(props.playOrPauseVideo(props.VideoRef))
                            }}
                        />
                    ) : (
                        <img
                            src="/assets/PlayerIcons/Play_icon.svg"
                            className="cursor-pointer w-[2rem] ml-[1rem]"
                            alt="playing Image"
                            onClick={() => {
                                props.playOrPauseVideo(props.VideoRef)
                            }}
                        />
                    )}
                    <img
                        src="/assets/PlayerIcons/Next_icon.svg"
                        className="cursor-pointer w-[2rem]  ml-[1rem]"
                        alt="playing Image"
                        onClick={() => {
                            // PlayOrPauseVideo()
                        }}
                    />

                    <div className="flex ml-8">
                        {props.Volume == 0 ? (
                            <img
                                src="/assets/PlayerIcons/VolumeOff_icon.svg"
                                className="cursor-pointer w-[1.6rem] mr-[1rem]"
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
                                className="cursor-pointer w-[1.6rem] mr-[1rem]"
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
                            className="h-[.5rem] focus:outline-none appearance-none w-[100%] bg-[#707070] self-center"
                            min="0"
                            max="1"
                            step="0.01"
                            onChange={e => {
                                props.setVolume(changeVolume(props.VideoRef, e))
                            }}
                            value={props.Volume}
                        />
                    </div>

                    <h1 className="text-white self-center ml-11">
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
                        className="cursor-pointer w-[1.6rem] mr-[1rem] ml-auto"
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
