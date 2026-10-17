#!/usr/bin/env python3
"""Trilha, efeitos e pré-mistura do filme, tudo sintetizado em numpy (sem baixar nada, determinista).

Entradas : video/build/timeline.json, video/build/audio-aparado/Fxxx.wav (voz aparada), video/cues/ato*.json (opcional)
Saídas   : video/build/music.wav (trilha, sem ducking), sfx.wav, voz.wav (voz com sala), mix-pre.wav (mistura com ducking, estéreo 48 kHz)
           video/build/mix-info.json (cues usados, ducking, níveis)
Uso      : python3 video/scripts/musica.py
Música   : eletrônica limpa, 100 BPM, pads em camadas (lá menor → maior conforme o ato), sub, arpejos discretos,
           kick/hi-hat suaves, envelopes por ato conforme timeline.atos[].musica/energia e frases-gatilho (F010, F053, F070, F075, F084, F091).
"""
import json, sys, wave, os, glob
import numpy as np

SR = 48000
BPM = 100.0
BEAT = 60.0 / BPM
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BUILD = os.path.join(RAIZ, "video", "build")
rng = np.random.default_rng(20261015)

tl = json.load(open(os.path.join(BUILD, "timeline.json"), encoding="utf8"))
DUR = tl["duracao"] + 1.0
N = int(DUR * SR)
FR = {f["id"]: f for f in tl["frases"]}
ATOS = {a["id"]: a for a in tl["atos"]}

def db(x): return 10 ** (x / 20.0)

def ler_wav(p):
    w = wave.open(p)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(axis=1)
    return x

def gravar_wav(p, L, R, k=1.0):
    y = np.stack([L, R], axis=1) * k
    y = np.clip(y, -1, 1)
    w = wave.open(p, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype("<i2").tobytes()); w.close()

def env_pl(pontos, n=N):
    """Envelope linear por partes, pontos = [(t, valor)], avaliado por amostra."""
    t = np.arange(n, dtype=np.float64) / SR
    ts, vs = zip(*sorted(pontos))
    return np.interp(t, ts, vs).astype(np.float32)

def val_em(pontos, t):
    ts, vs = zip(*sorted(pontos)); return float(np.interp(t, ts, vs))

def suave(x, tau, taxa):
    """Passa-baixa de 1 polo em taxa de controle (laço curto)."""
    a = np.exp(-1.0 / (tau * taxa)); y = np.empty_like(x); s = x[0]
    for i, v in enumerate(x):
        s = a * s + (1 - a) * v; y[i] = s
    return y

# ------------------------------------------------------------------ marcos do roteiro
t_f = lambda i: FR[i]["inicio"]
t_fim = lambda i: FR[i]["fim"]
fim_nar = tl["marcas"]["fimNarracao"]; card0, card1 = tl["marcas"]["cardFinal"]
a_ini = {k: v["inicio"] for k, v in ATOS.items()}
a_fim = {k: v["fim"] for k, v in ATOS.items()}

# ------------------------------------------------------------------ harmonia
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
ACORDES = {  # notas MIDI das vozes do pad (tríade com 9ª/oitava) e raiz do sub
    "Am": ([57, 60, 64, 71], 33), "F": ([53, 57, 60, 67], 29), "C": ([55, 60, 64, 71], 36),
    "G": ([55, 59, 62, 69], 31), "Dm": ([53, 57, 62, 69], 38), "Em": ([52, 59, 64, 71], 28),
    "Cadd9": ([55, 60, 64, 67, 74], 36),
}
PROG = {
    "A1": ["Am", "F", "C", "G"], "A2": ["Am", "F", "C", "G"], "A3": ["Am", "Em", "F", "G"],
    "A4": ["C", "G", "Am", "F"], "A5": ["Am", "Em"], "A6": ["Am", "F", "C", "G"],
    "A7": ["Dm", "Am", "Dm", "Em"], "A8": ["F", "C", "G", "Am", "F", "C", "G", "C"], "A9": ["C", "G", "Am", "F", "C"],
}
TROCA = 4 * BEAT * 2  # acorde a cada 2 compassos (4,8 s)
segs = []  # (t0, t1, acorde)
for a in tl["atos"]:
    t = a["inicio"]; i = 0
    while t < a["fim"] - 0.01:
        t1 = min(a["fim"], t + TROCA)
        if a["fim"] - t1 < 1.6: t1 = a["fim"]
        segs.append((t, t1, PROG[a["id"]][i % len(PROG[a["id"]])])); t = t1; i += 1
# resolução final: acorde de Dó maior com 9ª entra no "Vamos?" e segura até o fim
t_res = t_f("F091") - 0.15
segs = [(a, min(b, t_res), c) for a, b, c in segs if a < t_res] + [(t_res, DUR, "Cadd9")]

# ------------------------------------------------------------------ envelopes por camada (dB relativos / ganho linear 0..1)
f10, f53, f70, f75, f84, f91 = (t_f(k) for k in ("F010", "F053", "F070", "F075", "F084", "F091"))
cap = lambda a, b: max(a, b)
PAD = [(0, 0.0), (3.5, 0.55), (a_ini["A2"], 0.6), (a_ini["A3"], 0.6), (a_ini["A4"], 0.62), (a_ini["A5"] - 1, 0.62), (a_ini["A5"] + 2, 0.78),
       (a_ini["A6"] - 1, 0.78), (a_ini["A6"] + 2, 0.58), (f70 - 1, 0.58), (f70 + 1.5, 0.38), (a_fim["A7"] - 1, 0.40),
       (f75, 0.5), (f84, 0.75), (a_fim["A8"], 0.7), (a_ini["A9"] + 3, 0.7), (f91 - 0.4, 0.65), (f91 + 0.2, 1.0), (card0 + 1.5, 0.9), (card1 - 0.3, 0.35), (DUR - 0.8, 0.0)]
BRILHO = [(0, 0.0), (a_ini["A4"], 0.1), (a_ini["A4"] + 5, 0.55), (a_ini["A5"] - 1, 0.4), (a_ini["A5"] + 2, 0.0), (f70, 0.0),
          (f75, 0.1), (f84, 0.9), (a_fim["A8"], 0.8), (a_ini["A9"] + 3, 0.9), (f91, 1.0), (card1, 0.3), (DUR, 0.0)]
SUB = [(0, 0.0), (6, 0.5), (a_ini["A5"], 0.7), (f70, 0.45), (f75, 0.55), (f84, 0.9), (f91 - 0.3, 0.4), (f91, 1.0), (card1 - 0.5, 0.2), (DUR, 0.0)]
# batida: (t, ganho) — liga no F010, discreta e constante no A3, mais presente no A4, some no A5, volta no F053, cai nos riscos (F070), cresce no A8
KICK = [(0, 0.0), (f10 - 0.02, 0.0), (f10, 1.0), (a_ini["A3"], 0.7), (a_ini["A4"], 0.85), (a_ini["A5"] - 0.6, 0.85), (a_ini["A5"] - 0.1, 0.0),
        (f53 - 0.02, 0.0), (f53, 0.62), (f70 - 0.4, 0.62), (f70, 0.0), (f75 - 0.02, 0.0), (f75, 0.45), (f84, 1.0), (a_fim["A8"], 1.0),
        (a_ini["A9"] + 0.5, 1.0), (f91 - 0.5, 0.9), (f91 - 0.1, 0.0), (DUR, 0.0)]
HAT = [(t, v * k) for (t, v), k in zip(KICK, [0] * 2 + [0.9] * (len(KICK) - 2))]
ARP = [(0, 0.0), (f10 - 0.02, 0.0), (f10 + 4, 0.55), (a_ini["A3"], 0.5), (a_ini["A4"], 0.85), (a_ini["A5"] - 0.5, 0.0), (a_ini["A5"] + 20, 0.0),
       (f53, 0.0), (f53 + 6, 0.35), (f70 - 0.4, 0.35), (f70, 0.0), (f75, 0.0), (f75 + 2, 0.4), (f84, 0.9), (a_fim["A8"], 0.9), (a_ini["A9"] + 4, 0.9), (f91 - 0.3, 0.7), (f91 - 0.05, 0.0), (DUR, 0.0)]
# nível geral da trilha por ato (dB): calma no A5 e nos riscos, cresce no A8/A9
NIVEL_DB = [(0, -3), (a_ini["A5"], -3), (a_ini["A5"] + 1, -4), (a_ini["A6"], -2), (f70, -5), (f75, -3), (f84, 0), (a_ini["A9"], 1), (f91, 2), (card0, 1), (DUR, 0)]

# ------------------------------------------------------------------ síntese: pad e sub
padL = np.zeros(N, np.float32); padR = np.zeros(N, np.float32)
brL = np.zeros(N, np.float32); brR = np.zeros(N, np.float32)
subv = np.zeros(N, np.float32)
FADE = 1.4
for (t0, t1, nome) in segs:
    notas, raiz = ACORDES[nome]
    i0 = max(0, int((t0 - FADE) * SR)); i1 = min(N, int((t1 + FADE) * SR))
    if i1 <= i0: continue
    tt = (np.arange(i0, i1, dtype=np.float64) / SR)
    e = np.ones(i1 - i0, np.float32)
    a = np.clip((tt - (t0 - FADE)) / (2 * FADE), 0, 1); r = np.clip(((t1 + FADE) - tt) / (2 * FADE), 0, 1)
    if t0 <= 0.01: a[:] = 1
    e = (np.sin(a * np.pi / 2) ** 2 * np.sin(r * np.pi / 2) ** 2).astype(np.float32)
    lfo = (1 + 0.12 * np.sin(2 * np.pi * 0.11 * tt + t0)).astype(np.float32)
    for k, n in enumerate(notas):
        f = midi(n)
        for lado, det in ((0, -0.0035), (1, 0.0035)):
            ff = f * (1 + det)
            ph = 2 * np.pi * ff * tt + k * 1.3
            base = np.sin(ph) + 0.45 * np.sin(2 * ph + 0.4) + 0.18 * np.sin(3 * ph)
            alto = 0.22 * np.sin(4 * ph) + 0.16 * np.sin(5 * ph + 0.7) + 0.1 * np.sin(6 * ph) + 0.06 * np.sin(8 * ph)
            gn = (0.5 + 0.1 * (k % 2)) / len(notas)
            # voz mais grave ligeiramente à esquerda/direita para abrir o estéreo
            pl = gn * (1.0 if lado == 0 else 0.55); pr = gn * (0.55 if lado == 0 else 1.0)
            padL[i0:i1] += (base * pl * e * lfo).astype(np.float32); padR[i0:i1] += (base * pr * e * lfo).astype(np.float32)
            brL[i0:i1] += (alto * pl * e * lfo).astype(np.float32); brR[i0:i1] += (alto * pr * e * lfo).astype(np.float32)
    f = midi(raiz)
    s = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)).astype(np.float32)
    subv[i0:i1] += s * e * 0.5

pad_env = env_pl(PAD); br_env = env_pl(BRILHO); sub_env = env_pl(SUB)
musL = padL * pad_env * 0.55 + brL * br_env * pad_env * 0.5 + subv * sub_env * 0.45
musR = padR * pad_env * 0.55 + brR * br_env * pad_env * 0.5 + subv * sub_env * 0.45

# ------------------------------------------------------------------ síntese: batida e arpejos
def add(buf, x, i, g=1.0):
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i] * g

def kick_tpl():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 42 + 90 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t / 0.13) * np.minimum(1, t / 0.004)).astype(np.float32)
def hat_tpl():
    n = int(0.07 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = np.diff(x, prepend=0); x = np.diff(x, prepend=0)  # passa-altas grosseiro
    return (x * np.exp(-t / 0.012)).astype(np.float32) * 0.18
def clap_tpl():
    n = int(0.22 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = np.diff(x, prepend=0)
    return (x * np.exp(-t / 0.05)).astype(np.float32) * 0.12
def pluck_tpl(f, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t / 0.16) * np.minimum(1, t / 0.003)).astype(np.float32)

bat = np.zeros(N, np.float32); hat = np.zeros(N, np.float32); arpL = np.zeros(N, np.float32); arpR = np.zeros(N, np.float32)
kt, ht, ct = kick_tpl(), hat_tpl(), clap_tpl()
grid0 = f10
kick_env = KICK; hat_env = HAT; arp_env = ARP
def acorde_em(t):
    for a, b, nome in segs:
        if a <= t < b: return nome
    return segs[-1][2]
k = 0
while True:
    t = grid0 + k * BEAT / 2   # colcheias
    if t > DUR - 1: break
    gk = val_em(kick_env, t); gh = val_em(hat_env, t); ga = val_em(arp_env, t)
    i = int(t * SR); beat_no = k // 2
    if k % 2 == 0:
        if gk > 0.04 and beat_no % 4 in (0, 2): add(bat, kt, i, 0.9 * gk)
        if gk > 0.04 and beat_no % 4 == 3 and val_em(NIVEL_DB, t) > -2.5 and t > a_ini["A4"] and t < a_ini["A5"]: add(bat, kt, i + int(0.5 * BEAT * SR), 0.45 * gk)
        if gk > 0.3 and beat_no % 4 in (1, 3) and (a_ini["A4"] <= t < a_ini["A5"] or t >= f84): add(bat, ct, i, 0.8 * gk)
    else:
        if gh > 0.04: add(hat, ht, i, 0.7 * gh)
    if ga > 0.04:
        notas = ACORDES[acorde_em(t)][0]
        pad_notes = [n for n in notas] + [notas[0] + 12, notas[1] + 12]
        padr = [0, 2, 1, 3, 2, 4, 1, 3]
        n = pad_notes[padr[k % 8] % len(pad_notes)] + 12
        x = pluck_tpl(midi(n))
        pan = 0.25 + 0.5 * ((k // 1) % 2)
        add(arpL, x, i, 0.16 * ga * (1 - pan)); add(arpR, x, i, 0.16 * ga * pan)
        if (k % 4 == 1) and val_em(BRILHO, t) > 0.5:  # camada extra de 16 avos no A4/A8
            add(arpL, x, i + int(BEAT / 4 * SR), 0.07 * ga * pan); add(arpR, x, i + int(BEAT / 4 * SR), 0.07 * ga * (1 - pan))
    k += 1

nivel = db(env_pl(NIVEL_DB))
# "pump" suave da batida: o kick respira junto com o pad (não é o ducking da voz)
musL = (musL + bat * 0.55 + hat * 0.8 + arpL) * nivel
musR = (musR + bat * 0.55 + hat * 0.8 + arpR) * nivel

# normaliza a trilha para RMS de referência (-24 dBFS no trecho médio)
ref = np.sqrt(np.mean(np.concatenate([musL[int(10 * SR):int(100 * SR)], musR[int(10 * SR):int(100 * SR)]]) ** 2))
g_mus = db(-24) / max(ref, 1e-6)
musL *= g_mus; musR *= g_mus

# ------------------------------------------------------------------ efeitos sintetizados
def ir_cauda(rt60, dur, nivel_db, pre=0.02, escurecer=0.6, seed=3):
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    x = r.standard_normal(n).astype(np.float64)
    # escurece com média móvel crescente (aproximação barata)
    k = 1 + int(escurecer * 12); x = np.convolve(x, np.ones(k) / k, mode="same")
    x *= 10 ** (-3 * t / rt60) * np.minimum(1, t / 0.01)
    x[: int(pre * SR)] = 0
    x *= 10 ** (nivel_db / 20) / np.sqrt(np.sum(x ** 2))
    return x.astype(np.float32)

def conv(x, h):
    n = len(x) + len(h) - 1; m = 1
    while m < n: m <<= 1
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[:n].astype(np.float32)

def ruido_filtrado(dur, f0, f1, q=2.0, curva=1.0):
    """Ruído com passa-faixa varrendo f0→f1 (filtro de variável de estado em laço, curto)."""
    n = int(dur * SR); x = rng.standard_normal(n)
    t = np.linspace(0, 1, n) ** curva; f = f0 * (f1 / f0) ** t
    g = 2 * np.sin(np.pi * np.minimum(f, 9000) / SR); y = np.empty(n); lo = bp = 0.0; qq = 1.0 / q
    for i in range(n):
        lo += g[i] * bp; hi = x[i] - lo - qq * bp; bp += g[i] * hi; y[i] = bp
    return y.astype(np.float32)

def fx(tipo, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    if tipo == "whoosh":
        x = ruido_filtrado(dur, 250, 5200, q=1.6, curva=1.6)
        e = np.sin(np.pi * np.clip(t / dur, 0, 1) ** 0.8) ** 2
        L = x * e; R = np.roll(x, 70) * e
        return L, R * 0.9
    if tipo == "tick":
        n = int(max(dur, 0.04) * SR); t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.006) + 0.3 * rng.standard_normal(n) * np.exp(-t / 0.002)).astype(np.float32)
        return x, x
    if tipo == "impacto":
        f = 38 + 70 * np.exp(-t / 0.12); ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) * np.exp(-t / (dur * 0.35)) + 0.25 * np.sin(2 * np.pi * 96 * t) * np.exp(-t / 0.4)
        ruid = np.diff(rng.standard_normal(n), prepend=0) * np.exp(-t / 0.05) * 0.05
        x = (x + ruid).astype(np.float32)
        h = ir_cauda(1.6, 1.8, -8)
        w = conv(x, h)[:n]
        return x * 0.9 + w * 0.5, x * 0.9 + np.roll(w, 40) * 0.5
    if tipo == "swell":
        x = ruido_filtrado(dur, 300, 3800, q=1.2, curva=2.2)
        e = (np.clip(t / dur, 0, 1) ** 2.2) * np.minimum(1, (dur - t) / 0.08)
        return x * e, np.roll(x, 90) * e
    if tipo == "ding":
        fr = 1568.0; x = np.zeros(n)
        for r, a, d in ((1, 1.0, 1.0), (2.76, 0.35, 0.6), (5.4, 0.15, 0.35), (1.5, 0.2, 0.7)):
            x += a * np.sin(2 * np.pi * fr * r * t) * np.exp(-t / (dur * 0.30 * d))
        x = (x * np.minimum(1, t / 0.004) * 0.5).astype(np.float32)
        w = conv(x, ir_cauda(1.2, 1.3, -10))[:n]
        return x + w * 0.5, x + np.roll(w, 60) * 0.5
    if tipo == "pop":
        n = int(max(dur, 0.1) * SR); t = np.arange(n) / SR
        f = 300 + 500 * np.exp(-t / 0.02); x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)).astype(np.float32)
        return x, x
    if tipo == "sub":
        f = 46 - 8 * (t / dur); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
        x = x.astype(np.float32); return x, x
    raise ValueError(tipo)

# --- cues: padrões + arquivos video/cues/ato*.json
cues = []
for arq in sorted(glob.glob(os.path.join(RAIZ, "video", "cues", "ato*.json"))):
    try:
        for c in json.load(open(arq, encoding="utf8")):
            c["_origem"] = os.path.basename(arq); cues.append(c)
    except Exception as e:
        print("aviso: cue ilegível", arq, e, file=sys.stderr)
def tempo_cue(c):
    f = FR.get(c["frase"])
    if not f: return None
    ref = c.get("ref", "fala")
    base = f["inicio"] if ref == "fala" else f["tEnfase"] if ref == "enfase" else f["fim"]
    return base + float(c.get("dt", 0))
explicitos = []
for c in cues:
    t = tempo_cue(c)
    if t is None: print("aviso: cue com frase inexistente", c, file=sys.stderr); continue
    explicitos.append({"t": t, "tipo": c["tipo"], "dur": float(c.get("dur", 1.5)), "vol": float(c.get("vol", -18)), "origem": c["_origem"], "frase": c["frase"]})
padroes = []
for i, a in enumerate(tl["atos"][1:], 1):  # whoosh nas fronteiras de ato
    padroes.append({"t": a["inicio"] - 0.55, "tipo": "whoosh", "dur": 1.5, "vol": -17, "origem": "padrao", "frase": a["primeira"]})
padroes.append({"t": FR["F001"]["palavras"][1]["t0"] if len(FR["F001"]["palavras"]) > 1 else FR["F001"]["inicio"], "tipo": "sub", "dur": 1.4, "vol": -16, "origem": "padrao", "frase": "F001"})
padroes.append({"t": FR["F062"]["fim"] - 1.7, "tipo": "swell", "dur": 2.0, "vol": -22, "origem": "padrao", "frase": "F062"})
padroes.append({"t": FR["F063"]["tEnfase"] - 0.05, "tipo": "impacto", "dur": 2.4, "vol": -13, "origem": "padrao", "frase": "F063"})
padroes.append({"t": FR["F091"]["tEnfase"] - 0.05, "tipo": "ding", "dur": 3.2, "vol": -17, "origem": "padrao", "frase": "F091"})
padroes.append({"t": FR["F091"]["inicio"] - 0.2, "tipo": "swell", "dur": 1.2, "vol": -22, "origem": "padrao", "frase": "F091"})
usados = list(explicitos)
for p in padroes:  # o cue explícito do mesmo tipo a menos de 1,2 s substitui o padrão
    if not any(e["tipo"] == p["tipo"] and abs(e["t"] - p["t"]) < 1.2 for e in explicitos): usados.append(p)
usados.sort(key=lambda c: c["t"])
sfxL = np.zeros(N, np.float32); sfxR = np.zeros(N, np.float32)
for c in usados:
    L, R = fx(c["tipo"], c["dur"])
    pico = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-6)
    g = db(c["vol"]) / pico * 0.9  # vol = pico do efeito em dBFS (antes do nível final)
    i = int(max(0, c["t"]) * SR)
    add(sfxL, L.astype(np.float32), i, g); add(sfxR, R.astype(np.float32), i, g)

# ------------------------------------------------------------------ voz (com sala de bus) e ducking determinista
vozv = np.zeros(N, np.float32); vozw = np.zeros(N, np.float32)
IRV = ir_cauda(0.85, 1.0, -22, pre=0.018, escurecer=0.8, seed=11)
for f in tl["frases"]:
    p = os.path.join(BUILD, "audio-aparado", f["id"] + ".wav")
    if not os.path.exists(p): p = os.path.join(BUILD, "audio", f["id"] + ".wav")
    x = ler_wav(p); i = int(round(f["inicio"] * SR))
    add(vozv, x, i)
    add(vozw, conv(x, IRV), i)
voz_total = vozv + vozw
# janela de voz → ducking (taxa de controle 200 Hz)
CR = 200
nc = int(DUR * CR) + 2
alvo = np.zeros(nc, np.float32)
for f in tl["frases"]:
    a = int(max(0, (f["inicio"] - 0.10)) * CR); b = int(min(DUR, f["fim"] + 0.25) * CR)
    alvo[a:b + 1] = 1.0
# ataque rápido (0,12 s), soltura lenta (0,55 s); profundidade por ato (12–18 dB)
def suave_ar(x, ta, tr):
    aa = np.exp(-1 / (ta * CR)); ar = np.exp(-1 / (tr * CR)); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x):
        c = aa if v > s else ar
        s = c * s + (1 - c) * v; y[i] = s
    return y
cobertura = suave_ar(alvo, 0.12, 0.55)
prof_db = np.full(nc, 15.0, np.float32)
for a in tl["atos"]:
    d = {"A5": 16, "A7": 17, "A8": 14, "A9": 13}.get(a["id"], 15)
    prof_db[int(a["inicio"] * CR):int(a["fim"] * CR) + 1] = d
duck = db(-(prof_db * cobertura))
duckN = np.interp(np.arange(N) / SR, np.arange(nc) / CR, duck).astype(np.float32)

fade_fim = env_pl([(0, 1), (DUR - 1.2, 1), (DUR - 0.1, 0)])
mixL = (voz_total + musL * duckN + sfxL) * fade_fim
mixR = (voz_total + musR * duckN + sfxR) * fade_fim

pico = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
k = 0.89 / pico if pico > 0.89 else 1.0
# stems no mesmo ganho para continuarem somando ao mix
gravar_wav(os.path.join(BUILD, "music.wav"), musL * fade_fim, musR * fade_fim, k)
gravar_wav(os.path.join(BUILD, "sfx.wav"), sfxL, sfxR, k)
gravar_wav(os.path.join(BUILD, "voz.wav"), voz_total, voz_total, k)
gravar_wav(os.path.join(BUILD, "mix-pre.wav"), mixL, mixR, k)

def rms_db(x): return float(20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12))
ativo = np.zeros(N, bool)
for f in tl["frases"]: ativo[int(f["inicio"] * SR):int(f["fim"] * SR)] = True
reducao = float(np.max(prof_db * cobertura))
info = {
    "duracao": DUR, "bpm": BPM, "ganhoPre": float(k),
    "rmsVozDb": rms_db(voz_total[ativo]), "rmsMusicaSobVozDb": rms_db((musL * duckN)[ativo]),
    "rmsMusicaForaDaVozDb": rms_db((musL * duckN)[~ativo][: SR * 600]),
    "duckingMaxDb": reducao, "cues": [{k2: (round(v, 3) if isinstance(v, float) else v) for k2, v in c.items()} for c in usados],
}
json.dump(info, open(os.path.join(BUILD, "mix-info.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("musica.py ok: pico pré %.2f, voz %.1f dB RMS, música sob a voz %.1f dB, ducking máx %.1f dB, %d efeitos" % (pico, info["rmsVozDb"], info["rmsMusicaSobVozDb"], reducao, len(usados)))
