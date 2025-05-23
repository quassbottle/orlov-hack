from fastapi import FastAPI
from app import App
from config.config import parse
from huggingface_hub import login


CONFIG_SRC = '.config/prod.toml'

cfg = parse(CONFIG_SRC)
login(token=cfg.deep_seek_token)
app: FastAPI = App(cfg).get_app()


print('started')
