from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>¡Hola desde Flask con uWSGI!</h1>"

if __name__ == "__main__":
    app.run()
