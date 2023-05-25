import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import { IoCopy } from "react-icons/io5";
import { TbCopy } from "react-icons/tb";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import Logo from "../utils/codedekho.jpg"
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import Codeeditor from "../components/Codeeditor";
import MainEditor from "../components/MainEditor";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            type: "all",
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  const onCodeChange = (type,code) => {
    if(type==="code"){
      codeRef.current = {
        ...codeRef.current,
        code: code,
      }

    }
    if(type==="input"){
      codeRef.current = {
        ...codeRef.current,
        input: code
      }

    }

    if(type==="language"){
      codeRef.current = {
        ...codeRef.current,
        language: code
      }

    }

    if(type==="output"){
      codeRef.current = {
        ...codeRef.current,
        output: code
      }

    }
  }


  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo flex justify-center items-center">
          <img src={Logo} alt="logo" className="h-[3rem]"/>
            {/* <h1 className="heading"> Code Dheko </h1> */}
          </div>

          {/* <div className="filestr">
            <div className="jsfile bg-black"> index.js</div>
          </div> */}

          <h3>Contributors</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <div className="roomidbox">
          <input type="text" className="roomidinput" value={roomId} readOnly/>
          <button className="copyBtn border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0 " onClick={copyRoomId}>
            <TbCopy className="copyicon" />
          </button>
        </div>

        <button className="btn leaveBtn mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorWrap">
        
        <MainEditor
        socketRef={socketRef}
        roomId={roomId}
        onCodeChange={onCodeChange}
        />
        {/* </div> */}
      </div>
    </div>
  );
};

export default EditorPage;
