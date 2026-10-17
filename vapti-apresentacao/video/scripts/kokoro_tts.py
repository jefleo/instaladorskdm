#!/usr/bin/env python3
"""Sintetiza várias frases com Kokoro (pt-BR), carregando o modelo UMA vez.
Uso: kokoro_tts.py trabalhos.json
trabalhos.json = {"modelo": "...onnx", "vozes": "...bin", "voz": "pm_alex", "lang": "pt-br",
                  "itens": [{"id": "F001", "texto": "...", "velocidade": 0.97, "saida": "/caminho/F001.wav"}]}
Saída: WAV 24 kHz mono float (o voz.mjs reamostra para 48 kHz e pós-processa)."""
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

cfg = json.load(open(sys.argv[1], encoding="utf8"))
k = Kokoro(cfg["modelo"], cfg["vozes"])
for it in cfg["itens"]:
    audio, sr = k.create(it["texto"], voice=cfg.get("voz", "pm_alex"), speed=float(it.get("velocidade", 1.0)), lang=cfg.get("lang", "pt-br"))
    sf.write(it["saida"], audio, sr)
    print(it["id"], round(len(audio) / sr, 2), flush=True)
