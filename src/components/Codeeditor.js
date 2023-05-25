import React, { useEffect, useState } from "react";

import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const Codeeditor = ({
  socketRef,
  roomId,
  onCodeChange,
  onChange,
  language,
  code,
  theme,
}) => {
    
  const [value, setValue] = useState(code || "");

  const handleEditorChange = (value) => {
    setValue(value);
    onCodeChange(value);
    onChange("code", value);
    console.log(value);
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: value,
    });
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setValue(code);
          onCodeChange(code);
          onChange("code", code);
          console.log(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
      <Editor
        height="85vh"
        width={`100%`}
        language={"javascript"}
        value={value}
        theme={theme}
        defaultValue="// some comment"
        onChange={handleEditorChange}
      />
    </div>
  );
};
export default Codeeditor;
