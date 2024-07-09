import React, {useEffect, useRef} from "react";

const openCamera = async (video: HTMLVideoElement) => {
    const constraints = {
        audio: false,
        video: {
            facingMode: 'user',
        },
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        video.volume = 0;
        video.muted = true;
        video.style.zIndex = '1000';
        // video.play();
    } catch (error) {
        console.error('Error accessing the camera', error);
    }
}

export const SelfVideo = React.memo((props: {
    onLoad?: () => void;
    style?: React.CSSProperties;
    isStopped?: boolean;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        if (videoRef.current) {
            openCamera(videoRef.current);
            props.onLoad?.();

            if (props.isStopped) {
                videoRef.current.srcObject?.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        }
    }, []);

    return (
        <video
            ref={videoRef}
            style={{
                width: '100%',
                height: '100%',
                maxHeight: '466px',
                objectFit: 'cover',
                ...props.style,
            }}
        />
    );
});
