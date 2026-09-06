import React, { useEffect, useRef, useState } from 'react';
import { useMagazineAudio } from './AudioProvider';

const formatTime = (value) => {
    const total = Math.max(0, Math.round(value || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

const AudioPlayer = ({ post }) => {
    const src = post.audioFileUrl || post.audioUrl;
    const ctx = useMagazineAudio();
    const localRef = useRef(null);
    const [localPlaying, setLocalPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(post.durationSeconds || 0);
    const [rate, setRate] = useState(1);

    useEffect(() => {
        if (!ctx || !ctx.track || ctx.track.src !== src) return undefined;
        setLocalPlaying(ctx.playing);
        setProgress(ctx.progress);
        setDuration(ctx.duration || duration);
        return undefined;
    }, [ctx, src, duration]);

    if (!src) return null;
    const track = { src, title: post.title, id: post.id };

    const toggle = () => {
        if (ctx && ctx.play) {
            ctx.toggle(track);
            return;
        }
        const audio = localRef.current;
        if (!audio) return;
        if (localPlaying) audio.pause();
        else audio.play();
    };

    const seek = (value) => {
        if (ctx && ctx.track && ctx.track.src === src) ctx.seek(value);
        else if (localRef.current) localRef.current.currentTime = value;
        setProgress(value);
    };

    const changeRate = (next) => {
        setRate(next);
        if (ctx && ctx.setRate) ctx.setRate(next);
        if (localRef.current) localRef.current.playbackRate = next;
    };

    return (
        <div className="magazine-audio-player">
            <button type="button" className="magazine-audio-play" onClick={toggle} aria-label={localPlaying ? 'توقف' : 'پخش'}>
                {localPlaying || (ctx && ctx.playing && ctx.track && ctx.track.src === src) ? '❚❚' : '▶'}
            </button>
            <div className="magazine-audio-meta">
                <strong>{post.title}</strong>
                <div className="magazine-audio-seek">
                    <span>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={Math.min(progress, duration || 0)}
                        onChange={(e) => seek(Number(e.target.value))}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
            <label>
                سرعت
                <select value={rate} onChange={(e) => changeRate(Number(e.target.value))}>
                    {[0.75, 1, 1.25, 1.5, 1.75, 2].map((item) => (
                        <option key={item} value={item}>{item}×</option>
                    ))}
                </select>
            </label>
            <a className="magazine-audio-download" href={src} download>
                دانلود فایل صوتی
            </a>
            <audio
                ref={localRef}
                src={src}
                preload="metadata"
                onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || duration)}
                onPlay={() => setLocalPlaying(true)}
                onPause={() => setLocalPlaying(false)}
            />
        </div>
    );
};

export default AudioPlayer;
