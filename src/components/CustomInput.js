import React, { useEffect } from "react";
import { classnames } from "../utils/general";
import ACTIONS from "../Actions";

const CustomInput = ({
  socketRef,
  roomId,
  onCodeChange,
  customInput,
  setCustomInput,
}) => {
  
  
  const handleInputChange = (e) => {
    setCustomInput(e.target.value);
    onCodeChange("input", e.target.value);
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      type: "input",
      code: {
        input: e.target.value,
      },
    });
  };


  
  
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({type, code }) => {
        if (type == "input"|| type=="all") {
          if (code.input !== null) {
            setCustomInput(code.input);
            onCodeChange("input", code.input);
            console.log(code.code);
          }
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);



  return (
    <>
      <textarea
        rows="5"
        value={customInput}
        onChange={handleInputChange}
        placeholder={`Custom input`}
        className={classnames(
          "focus:outline-none w-full border-2 border-black z-10 rounded-md  px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
        )}
      ></textarea>
    </>
  );
};

export default CustomInput;
