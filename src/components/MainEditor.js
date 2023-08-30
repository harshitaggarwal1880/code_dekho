import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import Footer from "./Footer";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import Codeeditor from "./Codeeditor";
import ACTIONS from "../Actions";

const javascriptDefault = `


print("Hello World");

`;

const MainEditor = ({ socketRef, roomId, onCodeChange }) => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState({
    id: 71,
    name: "Python (3.8.1)",
    label: "Python (3.8.1)",
    value: "python",
  });

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const Rapid_api_url = "https://judge0-ce.p.rapidapi.com/submissions";
  const Rapid_api_host = "judge0-ce.p.rapidapi.com";
  const Rapid_api_key = "2108bd5b7amsh9e0268f67a7e3afp16b499jsn9295fb735fb3";

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  const handleCompile = () => {
    setProcessing(true);
    // console.log(first)
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "2108bd5b7amsh9e0268f67a7e3afp16b499jsn9295fb735fb3",
      },
      data: formData,
    };
    console.log(options);
    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(`Quota of 100 requests exceeded for the Day! `, 10000);
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ type, code }) => {
        if (type == "output" || type == "all") {
          if (code.output !== null) {
            setProcessing(true);
            setOutputDetails(code.output);
            onCodeChange("output", code.output);
            setProcessing(false);
            console.log(code.output);
          }
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: Rapid_api_url + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": Rapid_api_host,
        "X-RapidAPI-Key": Rapid_api_key,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);

        setOutputDetails(response.data);

        onCodeChange("output", response.data);

        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          type: "output",
          code: {
            output: response.data,
          },
        });

        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="h-4 w-full bg-gradient-to-r from-blue-950 via-red-500 to-yellow-500"></div>

      <div className="flex flex-row">
        <div className="px-4 py-2">
          <LanguagesDropdown
            onSelectChange={onSelectChange}
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={onCodeChange}
          />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={onCodeChange}
            handleThemeChange={handleThemeChange}
            theme={theme}
          />
        </div>
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-2">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <Codeeditor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={onCodeChange}
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <CustomInput
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={onCodeChange}
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
            <button
              onClick={handleCompile}
              disabled={!code}
              className={classnames(
                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};
export default MainEditor;
