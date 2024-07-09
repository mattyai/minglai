
import {Mic} from "../icons/Mic.tsx";
import {MicMuted} from "../icons/MicMuted.tsx";

export const FooterToolbar = (props: {
    status: 'Mute' | 'Unmute';
    onMute: () => void;
    onUnmute: () => void;
}) => {
    const isMuted = props.status === 'Mute';

    return (
        <div className={'footer-toolbar'}>
            <button
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    padding: '2px 0 0',
                    cursor: 'pointer',
                    backgroundColor: isMuted ? 'red' : 'black',
                }}
                onClick={() => {
                    if (isMuted) {
                        props.onUnmute();
                    } else {
                        props.onMute();
                    }
                } }
            >
                {isMuted ? <MicMuted style={{
                    width: '20px',
                    height: '20px',
                    fill: 'white',
                }}  /> : <Mic style={{
                    width: '20px',
                    height: '20px',
                    fill: 'white',

                }} />}
            </button>
        </div>
    )
}
