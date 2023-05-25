import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Logo from "../utils/codedekho.jpg"

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };
    return (
        <div className="homePageWrapper bg-gradient-to-br from-blue-500 to-purple-500">
            <div className="formWrapper">
                    {/* <h1 className='heading'> Code Dheko </h1> */}
                    <div className='flex justify-center items-center mb-4'>
                    <img src={Logo} alt="logo" className='h-[4rem]'  />
                    </div>
                <h4 className="mainLabel">Join Room using Username and RoomID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    /> 
                    
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    
                </div>
            </div>
            
        </div>
    );
};

export default Home;
