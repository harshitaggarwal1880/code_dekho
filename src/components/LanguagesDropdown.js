import React, { useEffect, useState } from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles";
import { languageOptions } from "../constants/languageOptions";
import ACTIONS from "../Actions";

const LanguagesDropdown = ({
  socketRef,
  roomId,
  onCodeChange,
  onSelectChange,
}) => {
  const [language, setlanguage] = useState({
    id: 71,
    name: "Python (3.8.1)",
    label: "Python (3.8.1)",
    value: "python",
  });

  const handleLanguageChange = (selectedOption) => {
    onSelectChange(selectedOption);

    setlanguage(selectedOption);
    onCodeChange("language", selectedOption);

    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      type: "language",
      code: {
        language: selectedOption,
      },
    });
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ type, code }) => {
        if (type == "language" || type == "all") {
          if (code.language !== null) {
            setlanguage(code.language);
            onCodeChange("code", code.language);
            onSelectChange(code.language);
            console.log(code.language)
          }
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <Select
      placeholder={`Filter By Category`}
      options={languageOptions}
      styles={customStyles}
      // defaultValue={language}
      value={language}
      onChange={handleLanguageChange}
    />
  );
};

export default LanguagesDropdown;
