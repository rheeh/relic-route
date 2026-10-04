#!/usr/bin/env python3
"""标准库合成 40 秒深空氛围、UI 与武器音效；不使用外部采样。"""

from array import array
import math
from pathlib import Path
import random
import sys
import wave

ROOT = Path(__file__).resolve().parent.parent
RATE = 48000
DURATION = 40.0
FRAMES = int(RATE * DURATION)
TAU = 2 * math.pi


def envelope(t, length, attack=0.008, release=0.15):
    return min(1.0, t / attack) * min(1.0, max(0.0, (length - t) / release))


def synthesize():
    left = array("f", [0.0]) * FRAMES
    right = array("f", [0.0]) * FRAMES
    rng = random.Random(2042)
    smooth_noise = 0.0

    # 低音呼吸、细微泛音与平滑噪声；持续音让 UI 瞬态保持清楚。
    for frame in range(FRAMES):
        t = frame / RATE
        fade = min(1.0, t / 2.0, max(0.0, (DURATION - t) / 2.0))
        breathe = 0.76 + 0.24 * math.sin(TAU * 0.065 * t)
        smooth_noise = smooth_noise * 0.994 + rng.uniform(-1, 1) * 0.006
        bass = 0.035 * math.sin(TAU * 55.0 * t)
        overtone = 0.015 * math.sin(TAU * 82.4069 * t + 0.16 * math.sin(TAU * 0.09 * t))
        high = 0.006 * math.sin(TAU * 164.8138 * t)
        texture = 0.019 * smooth_noise
        pan = 0.06 * math.sin(TAU * 0.11 * t)
        left[frame] = fade * breathe * (bass + overtone + high + texture) * (1.0 - pan)
        right[frame] = fade * breathe * (bass + overtone + high + texture) * (1.0 + pan)

    def add(start, length, sound, gain=1.0, pan=0.0):
        first = int(start * RATE)
        last = min(FRAMES, int((start + length) * RATE))
        for frame in range(first, last):
            t = (frame - first) / RATE
            value = gain * sound(t, length)
            left[frame] += value * (1.0 - max(0.0, pan))
            right[frame] += value * (1.0 + min(0.0, pan))

    def click(t, length):
        decay = math.exp(-t * 42)
        return 0.20 * decay * envelope(t, length, 0.002, 0.025) * (
            math.sin(TAU * (880 * t + 1300 * t * t)) + 0.28 * math.sin(TAU * 1760 * t)
        )

    def character(t, length):
        return 0.10 * envelope(t, length, 0.005, 0.07) * math.exp(-t * 19) * (
            math.sin(TAU * (440 * t + 380 * t * t)) + 0.32 * math.sin(TAU * 660 * t)
        )

    def panel(t, length):
        return 0.09 * envelope(t, length, 0.012, 0.15) * math.exp(-t * 5) * (
            math.sin(TAU * (280 * t + 540 * t * t)) + 0.32 * math.sin(TAU * 700 * t)
        )

    def confirm(t, length):
        return 0.11 * envelope(t, length, 0.006, 0.12) * math.exp(-t * 7) * (
            math.sin(TAU * 660 * t) + 0.4 * math.sin(TAU * 990 * t)
        )

    def depart(t, length):
        return 0.09 * envelope(t, length, 0.04, 0.35) * (
            math.sin(TAU * (105 * t + 65 * t * t)) + 0.2 * math.sin(TAU * (420 * t + 650 * t * t))
        )

    def pulse_fire(t, length):
        # 武器 0：细小柔和的高频脉冲，低振幅短尾音。
        phase = 1250 * t - 420 * t * t / (2 * length)
        return 0.09 * envelope(t, length, 0.006, 0.07) * math.exp(-t * 13) * (
            math.sin(TAU * phase) + 0.18 * math.sin(TAU * 1740 * t)
        )

    def mechanical_fire(t, length):
        # 武器 1：低音反冲、轻机械瞬态与短金属余响。
        phase = 125 * t - 65 * t * t / (2 * length)
        body = 0.145 * math.sin(TAU * phase) * math.exp(-t * 11)
        metal = 0.038 * math.sin(TAU * 520 * t) * math.exp(-t * 22)
        tail = 0.024 * math.sin(TAU * 330 * t) * math.exp(-t * 8)
        texture = 0.025 * rng.uniform(-1, 1) * math.exp(-t * 60)
        return envelope(t, length, 0.004, 0.13) * (body + metal + tail + texture)

    def light_charge(t, length):
        ramp = 0.25 + 0.75 * t / length
        phase = 140 * t + 450 * t * t / (2 * length)
        return 0.05 * ramp * envelope(t, length, 0.05, 0.09) * (
            math.sin(TAU * phase) + 0.15 * math.sin(TAU * phase * 2)
        )

    def light_fire(t, length):
        # 武器 2：两次独立的短光点音，成对触发。
        return 0.085 * envelope(t, length, 0.004, 0.04) * math.exp(-t * 21) * (
            math.sin(TAU * 1320 * t) + 0.18 * math.sin(TAU * 1980 * t)
        )

    def shield_charge(t, length):
        ramp = 0.3 + 0.7 * t / length
        phase = 90 * t + 58 * t * t / (2 * length)
        return 0.07 * ramp * envelope(t, length, 0.05, 0.1) * (
            math.sin(TAU * phase) + 0.22 * math.sin(TAU * phase * 2)
        )

    def shield_impact(t, length):
        # 武器 3：低沉护盾冲击与收束的能量刃共鸣，不叠加爆炸声。
        phase = 95 * t - 40 * t * t / (2 * length)
        low = 0.14 * math.sin(TAU * phase) * math.exp(-t * 5)
        blade_phase = 660 * t - 180 * t * t / (2 * length)
        blade = 0.032 * math.sin(TAU * blade_phase) * math.exp(-t * 8)
        resonance = 0.045 * math.sin(TAU * 112 * t) * math.exp(-t * 7)
        return envelope(t, length, 0.008, 0.2) * (low + blade + resonance)

    def scan(t, length):
        pulse = 0.70 + 0.30 * math.sin(TAU * 6.5 * t) ** 2
        # 320→1180 Hz 的柔和上行扫描；轻泛音不越过 2360 Hz。
        phase = 320 * t + (1180 - 320) * t * t / (2 * length)
        return 0.055 * envelope(t, length, 0.04, 0.16) * pulse * (
            math.sin(TAU * phase) + 0.12 * math.sin(TAU * phase * 2)
        )

    def reveal(t, length):
        return 0.10 * envelope(t, length, 0.008, 0.2) * math.exp(-t * 4) * (
            math.sin(TAU * 880 * t) + 0.5 * math.sin(TAU * 1320 * t)
        )

    def claim(t, length):
        return 0.095 * envelope(t, length, 0.012, 0.3) * math.exp(-t * 3.6) * (
            math.sin(TAU * 523.251 * t) + 0.55 * math.sin(TAU * 783.991 * t)
            + 0.3 * math.sin(TAU * 1046.502 * t)
        )

    def ending(t, length):
        return 0.055 * envelope(t, length, 0.08, 0.8) * math.exp(-t * 1.1) * (
            math.sin(TAU * 220 * t) + 0.6 * math.sin(TAU * 329.6276 * t)
            + 0.25 * math.sin(TAU * 440 * t)
        )

    # 40 秒 Canvas 展示：角色→装备试验→星图→档案→确认→回收→片尾。
    add(2.0, 0.18, character, pan=-0.16)
    add(4.0, 0.18, character, pan=0.16)
    add(6.0, 0.18, character, pan=-0.08)
    add(8.0, 0.38, panel)
    add(8.8, 0.25, pulse_fire)
    add(10.7, 0.12, click, gain=0.75)
    add(11.3, 0.42, mechanical_fire)
    add(13.5, 0.12, click, gain=0.75)
    add(13.8, 1.0, light_charge)
    add(14.8, 0.12, light_fire, pan=-0.1)
    add(14.96, 0.12, light_fire, gain=0.85, pan=0.1)
    add(16.5, 0.12, click, gain=0.75)
    add(16.8, 1.0, shield_charge)
    add(17.8, 0.8, shield_impact)
    add(19.0, 0.38, panel)
    add(21.0, 0.12, click, pan=-0.12)
    add(23.0, 0.12, click, pan=0.12)
    add(24.0, 0.38, panel)
    add(28.0, 0.3, confirm)
    add(31.0, 0.8, depart)
    add(32.0, 1.6, scan, pan=0.1)
    add(33.6, 0.55, reveal, gain=0.8)
    add(36.0, 0.75, claim)
    add(38.0, 2.0, ending)

    # 最终混音淡入/淡出，最后一个 PCM 采样回到零附近。
    for frame in range(FRAMES):
        t = frame / RATE
        fade = min(1.0, t / 0.35, max(0.0, (DURATION - t) / 0.55))
        left[frame] *= fade
        right[frame] *= fade

    peak = max(max(abs(v) for v in left), max(abs(v) for v in right))
    # 原始混音保留足够峰值余量；仅必要时缩小，不抬高背景音。
    scale = min(1.0, 0.82 / peak)
    pcm = array("h")
    for lvalue, rvalue in zip(left, right):
        pcm.append(round(lvalue * scale * 32767))
        pcm.append(round(rvalue * scale * 32767))
    if sys.byteorder != "little":
        pcm.byteswap()
    output = ROOT / "output/score.wav"
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        stream.writeframes(pcm.tobytes())
    print(f"已合成：{output}")
    print(f"{DURATION:g} 秒 · 48 kHz · 双声道 · 峰值 {20 * math.log10(peak * scale):.1f} dBFS")


if __name__ == "__main__":
    synthesize()
