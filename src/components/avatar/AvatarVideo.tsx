import React, {useEffect, useRef} from 'react';
import {Participant} from "../../context/ConversationContext.tsx";

interface AvatarVideoProps {
    participant: Participant;
}

let previousAnimationFrameTimestamp = 0;

// Make video background transparent by matting
function makeBackgroundTransparent(timestamp, video, canvas, tmpCanvas, force = true) {
    // Throttle the frame rate to 30 FPS to reduce CPU usage
    if (force || (timestamp - previousAnimationFrameTimestamp > 30)) {
        const tmpCanvasContext = tmpCanvas.getContext('2d', {willReadFrequently: true})
        tmpCanvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        if (video.videoWidth > 0) {
            const frame = tmpCanvasContext.getImageData(0, 0, video.videoWidth, video.videoHeight)
            for (let i = 0; i < frame.data.length / 4; i++) {
                let r = frame.data[i * 4 + 0]
                let g = frame.data[i * 4 + 1]
                let b = frame.data[i * 4 + 2]
                if (g - 150 > r + b) {
                    // Set alpha to 0 for pixels that are close to green
                    frame.data[i * 4 + 3] = 0
                } else if (g + g > r + b) {
                    // Reduce green part of the green pixels to avoid green edge issue
                    const adjustment = (g - (r + b) / 2) / 3
                    r += adjustment
                    g -= adjustment * 2
                    b += adjustment
                    frame.data[i * 4 + 0] = r
                    frame.data[i * 4 + 1] = g
                    frame.data[i * 4 + 2] = b
                    // Reduce alpha part for green pixels to make the edge smoother
                    const a = Math.max(0, 255 - adjustment * 4)
                    frame.data[i * 4 + 3] = a
                }
            }

            const canvasContext = canvas.getContext('2d')
            canvasContext.putImageData(frame, 0, 0);
        }

        if (!force) {
            previousAnimationFrameTimestamp = timestamp
        }
    }

    window.requestAnimationFrame((timestamp) => {
        makeBackgroundTransparent(timestamp, video, canvas, tmpCanvas);
    })
}

export const AvatarVideo: React.FC<AvatarVideoProps> = (props: AvatarVideoProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tempCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const sourceVideo = props.participant.videoElement || document.querySelector('#video-' + props.participant.id + ' video') as HTMLVideoElement;

    useEffect(() => {
        if (!canvasRef.current || !tempCanvasRef.current || !sourceVideo) {
            return;
        }

        const current = canvasRef.current;

        previousAnimationFrameTimestamp = 0;


        makeBackgroundTransparent(previousAnimationFrameTimestamp, sourceVideo, canvasRef.current, tempCanvasRef.current)

        const play = () => {
            makeBackgroundTransparent(previousAnimationFrameTimestamp, sourceVideo, canvasRef.current, tempCanvasRef.current)
        }

        sourceVideo.addEventListener('play', play);

        return () => {
            if (current) {
                current.getContext('2d').clearRect(0, 0, current.width, current.height)
            }

            sourceVideo.removeEventListener('play', play)
        }
    }, [tempCanvasRef.current, sourceVideo, canvasRef.current, props.participant.id]);

    useEffect(() => {
        if (sourceVideo && !props.participant.hasTransparentBackground) {
            videoRef.current.srcObject = sourceVideo.srcObject;
            videoRef.current.play();
        }
    }, [sourceVideo, props.participant.hasTransparentBackground]);
    if (!sourceVideo) {
        return <img
            style={{
                height: '466px',
                objectFit: 'cover',
            }}
            src={props.participant.avatarUrl}
        />
    }

    if (!props.participant.hasTransparentBackground) {
        return (
            <video
                key={props.participant.id + '-video'}
                id={'video-' + props.participant.id}
                ref={videoRef}
                style={{
                    width: '100%',
                    height: '466px',
                    objectFit: 'cover',
                }}
            />
        )
    }

    return (
        <div
            style={{
                height: '500px',
                maxHeight: '466px',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    backgroundImage: `url(${props.participant.backgroundUrl})`,
                    backgroundSize: '1000px',
                    backgroundRepeat: 'no-repeat',
                    paddingTop: 88,
                }}
            >
                <canvas
                    key={props.participant.id + '-canvas'}
                    id={'avatar-video-' + props.participant.id}
                    ref={canvasRef}
                    width={sourceVideo?.videoWidth}
                    height={sourceVideo?.videoHeight}
                    style={{
                        width: '520px',
                    }}
                />
            </div>
            <canvas
                key={props.participant.id + '-tmp-canvas'}
                ref={tempCanvasRef}
                width={sourceVideo?.videoWidth}
                height={sourceVideo?.videoHeight}
                style={{
                    display: 'none'
                }}
            />
        </div>
    );
};
