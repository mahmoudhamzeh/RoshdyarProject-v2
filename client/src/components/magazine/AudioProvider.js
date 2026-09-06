import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const AudioContextValue = createContext(null);

export const useMagazineAudio = () => useContext(AudioContextValue);

export const MagazineAudioProvider = ({ children }) => {
    const audioRef = useRef(null);
    const trackRef = useRef(null);
    const [track, setTrack] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const pause = useCallback(() => {
        if (audioRef.current) audioRef.current.pause();
        setPlaying(false);
    }, []);

    const play = useCallback((nextTrack) => {
        const audio = audioRef.current;
        if (!audio) return;
        if (nextTrack && (!trackRef.current || trackRef.current.src !== nextTrack.src)) {
            audio.src = nextTrack.src;
            trackRef.current = nextTrack;
            setTrack(nextTrack);
        }
        audio.playbackRate = rate;
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, [rate]);

    const toggle = useCallback((nextTrack) => {
        const current = trackRef.current;
        if (playing && (!nextTrack || (current && current.src === nextTrack.src))) pause();
        else play(nextTrack || current);
    }, [playing, pause, play]);

    const seek = useCallback((value) => {
        if (audioRef.current) audioRef.current.currentTime = value;
    }, []);

    const changeRate = useCallback((next) => {
        setRate(next);
        if (audioRef.current) audioRef.current.playbackRate = next;
    }, []);

    const api = useMemo(() => ({
        track,
        playing,
        rate,
        progress,
        duration,
        play,
        pause,
        toggle,
        seek,
        setRate: changeRate
    }), [track, playing, rate, progress, duration, play, pause, toggle, seek, changeRate]);

    return (
        <AudioContextValue.Provider value={api}>
            {children}
            <audio
                ref={audioRef}
                preload="none"
                onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
            />
            {track && (
                <div className="magazine-mini-player">
                    <button type="button" onClick={() => (playing ? pause() : play(track))}>
                        {playing ? '❚❚' : '▶'}
                    </button>
                    <div>
                        <strong>{track.title}</strong>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                        />
                    </div>
                    <select value={rate} onChange={(e) => changeRate(Number(e.target.value))}>
                        {[0.75, 1, 1.25, 1.5, 1.75, 2].map((item) => (
                            <option key={item} value={item}>{item}x</option>
                        ))}
                    </select>
                </div>
            )}
        </AudioContextValue.Provider>
    );
};
