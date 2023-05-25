import React, { useEffect } from "react";
import Select from "react-select";
import monacoThemes from "monaco-themes/themes/themelist";
import { customStyles } from "../constants/customStyles";
import ACTIONS from "../Actions";

const ThemeDropdown = ({
  socketRef,
  roomId,
  onCodeChange,
  handleThemeChange,
  theme,
}) => {
  const handleThemechange = (theme) => {
    handleThemeChange(theme);

    // onCodeChange("theme", theme);

    // socketRef.current.emit(ACTIONS.CODE_CHANGE, {
    //   roomId,
    //   type: "theme",
    //   code: {
    //     theme: theme,
    //   },
    // });
  };

  // useEffect(() => {
  //   if (socketRef.current) {
  //     socketRef.current.on(ACTIONS.CODE_CHANGE, ({ type, code }) => {
  //       if (type == "theme" || type == "all") {
  //         if (code.theme !== null) {
  //           // onCodeChange("code", code.language);
  //           handleThemeChange(code.theme);
  //           console.log(code.theme);
  //         }
  //       }
  //     });
  //   }

  //   return () => {
  //     socketRef.current.off(ACTIONS.CODE_CHANGE);
  //   };
  // }, [socketRef.current]);

  return (
    <Select
      placeholder={`Select Theme`}
      // options={languageOptions}
      options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
        label: themeName,
        value: themeId,
        key: themeId,
      }))}
      value={theme}
      styles={customStyles}
      onChange={handleThemechange}
    />
  );
};

export default ThemeDropdown;
