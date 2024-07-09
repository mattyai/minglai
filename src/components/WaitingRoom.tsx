import {useState} from "react";
import {sleep} from "../utils/sleep.ts";
import {useConversation} from "../context/ConversationContext.tsx";
import {AvatarVideo} from "./avatar/AvatarVideo.tsx";
import {getFormattedNames} from "../utils/text.ts";

const getFormattedJoiningNames = (names: string[]) => {
    switch (names.length) {
        case 0:
            return 'We are joining the meeting ...';
        case 1:
            return `${names[0]} is in the meeting`;
        default:
            // Example: "Alice, Bob and Carol are in the meeting"
            return `${getFormattedNames(names)} are in the meeting`;
    }
};

export const WaitingRoom = (props: {
    onJoin: () => void;
}) => {
    const [isJoining, setIsJoining] = useState(false);
    const {participants} = useConversation();

    const currentParticipants = participants.filter((participant) => participant.isVideoOn && participant.id !== 'human');
    const humanUser = participants.find((participant) => participant.id === 'human');

    return (
        <div className={'waiting-room-wrapper'}>
            {humanUser && <div className={'self-video-container'}>
                {!humanUser.isVideoOn &&
                  <div
                    style={{
                        width: '400px',
                        height: '366px',
                        backgroundColor: 'gray',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                  >
                    Start your camera
                  </div>}
              <AvatarVideo participant={humanUser}/>
            </div>}
            <div
                style={{
                    textAlign: 'left',
                    width: '90%',
                }}>
                <h2>Welcome to</h2>
                <h1>MinglAI</h1>
                <h2>Your friends are waiting for you</h2>
                <br/>
                <p>
                    <span
                        className={'waiting-room'}
                    >
                        {currentParticipants.map((participant) => {
                                return <img
                                    key={participant.id}
                                    src={participant.avatarUrl}
                                    title={participant.name}
                                    alt={participant.name}
                                />
                            }
                        )}
                    </span>
                    {getFormattedJoiningNames(currentParticipants.map((participant) => participant.name))}
                </p>
                <button
                    style={{
                        width: '200px',
                        height: '50px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        backgroundColor: '#007bff',
                    }}
                    onClick={async () => {
                        setIsJoining(true);
                        await sleep(1000);
                        props.onJoin();
                    }}
                >
                    {isJoining ? 'Joining...' : 'Join'}
                </button>
            </div>
        </div>
    )
}
