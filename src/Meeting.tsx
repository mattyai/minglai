import {ActiveSpeaker} from "./components/ActiveSpeaker.tsx";
import {useState} from "react";
import {WaitingRoom} from "./components/WaitingRoom.tsx";
import {MeetingEnd} from "./components/MeetingEnd.tsx";
import {Footer} from "./components/Footer.tsx";
import {ParticipantsSidebar} from "./components/ParticipantsSidebar.tsx";
import {useAddParticipants} from "./hooks/useAddParticipants.ts";

export const Meeting = () => {
    const [isEnded, setIsEnded] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    console.log('Meeting', {isEnded, isJoined})

    useAddParticipants();

    if (!isJoined) {
        return <WaitingRoom onJoin={async () => {
            setIsJoined(true);
        }}/>;
    }

    if (isEnded) {
        return <MeetingEnd/>;
    }

    return (
        <div>
            <main>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <ActiveSpeaker/>
                    <ParticipantsSidebar/>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
