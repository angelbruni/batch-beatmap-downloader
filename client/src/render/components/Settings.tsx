import { useEffect, useState } from "react";
import Switch from "react-switch";
import { toast } from 'react-toastify'
import { Browse } from "./Browse";

interface PropTypes {
  onBeatmapsLoaded?: (ids: number[]) => void;
}

export const Settings = ({ onBeatmapsLoaded }: PropTypes) => {
  const [path, setPath] = useState<string>("");
  const [altPathEnabled, setAltPathEnabled] = useState(false)
  const [altPath, setAltPath] = useState<string>("")
  const [beatmaps, setBeatmaps] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const loadBeatmaps = () => {
    window.electron.loadBeatmaps().then(ids => {
      toast.success(`Found ${ids.length} beatmap sets`)
      setBeatmaps(ids);
    })
  }

  useEffect(() => {
    if (!path) return
    window.electron.setPath(path).then(res => {
      if (res && !altPathEnabled) {
        loadBeatmaps()
      }
    })
  }, [path])

  useEffect(() => {
    if (!altPath) return
    window.electron.setAltPath(altPath).then(() => {
      loadBeatmaps()
    })
  }, [altPath])

  useEffect(() => {
    if (onBeatmapsLoaded) {
      onBeatmapsLoaded(beatmaps);
    }
  }, [beatmaps, onBeatmapsLoaded]);

  const updateTheme = async (mode: boolean) => {
    await window.electron.setTheme(mode);
    setDarkMode(mode);
    document.documentElement.classList.toggle("dark", mode);
  };

  useEffect(() => {
    window.electron.getSettings().then((res) => {
      if (res.altPath) {
        setAltPath(res.altPath as string);
        setAltPathEnabled(true);
      }

      if (res.path) {
        setPath(res.path as string);
        window.electron.loadBeatmaps().then((res) => {
          setBeatmaps(res);
        });
      }

      if (res.darkMode) {
        const mode = res.darkMode as boolean;
        setDarkMode(mode);
        document.documentElement.classList.toggle("dark", mode);
      }
    });
  }, []);

  const enableAltPath = (enabled: boolean) => {
    setAltPathEnabled(enabled);

    if (!enabled) {
      setAltPath("")
      window.electron.setAltPath("").then(() => {
        loadBeatmaps()
      })
    }
  }

  return (
    <div className="bg-white dark:bg-monokai-dark rounded shadow p-6 flex flex-col dark:text-white w-full">
      <span className="font-bold text-lg">Settings</span>
      <div className="flex flex-col gap-4">
        <div className="flex items-center mt-4 gap-2">
          <span className="w-44">osu! Path:</span>
          <Browse path={path} update={setPath} />
          {!altPathEnabled && <span>{beatmaps.length} Beatmap Sets Found</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-44">Alternate Songs Path:</span>
          <Switch onChange={(mode) => enableAltPath(mode)} checked={altPathEnabled} />
          {altPathEnabled && <Browse path={altPath} update={setAltPath} />}
          {altPathEnabled && <span>{beatmaps.length} Beatmap Sets Found</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-44">Dark Mode:</span>
          <Switch onChange={(mode) => updateTheme(mode)} checked={darkMode} />
        </div>
      </div>
    </div>
  );
};
function setAltPath(arg0: string) {
  throw new Error("Function not implemented.");
}

