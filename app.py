from sanic import Sanic
from sanic_cors import CORS, cross_origin
from veil import Veil
import settings


app = Sanic()
app.blueprint(Veil)
app.config.from_object(settings)
CORS(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)