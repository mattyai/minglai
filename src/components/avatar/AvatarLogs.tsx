import React from 'react';

interface AvatarLogsProps {
    logs: string[];
}

export const AvatarLogs: React.FC<AvatarLogsProps> = ({ logs }) => {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            <div className="bg-gray-100 p-2 rounded h-32 overflow-y-auto">
                {logs.map((log, index) => (
                    <p key={index}>{log}</p>
                ))}
            </div>
        </div>
    );
};
