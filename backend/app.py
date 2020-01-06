from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import Column
from sqlalchemy import (
    Integer, String, DateTime, Text,
    ForeignKey, text
)
import os

backend_path = os.path.dirname(os.path.abspath(__file__))
db_file_path = os.path.join(backend_path, "db.sqlite3")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file_path}"
db = SQLAlchemy(app)


class VideoMeasurement(db.Model):
    __tablename__ = 'video_measurement'

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(Integer, ForeignKey('video.id', ondelete="CASCADE"))
    video = relationship("Video", back_populates="measurements")
    measurement_date = Column(DateTime())
    sub_count = Column(Integer, server_default=text("0"))
    comments = Column(Integer, server_default=text("0"))
    subscribersgained = Column(Integer, server_default=text("0"))
    subscriberslost = Column(Integer, server_default=text("0"))
    unsub_views = Column(Integer, server_default=text("0"))
    unsub_likes = Column(Integer, server_default=text("0"))
    unsub_dislikes = Column(Integer, server_default=text("0"))
    unsub_shares = Column(Integer, server_default=text("0"))

    def as_json(self):
        return {
            'id': self.id,
            'video_id': self.video_id,
            'measurement_date': self.measurement_date.isoformat(),
            'comments': self.comments,
            'sub_count': self.sub_count,
            'subscribersgained': self.subscribersgained,
            'subscriberslost': self.subscriberslost,
            'unsub_views': self.unsub_views,
            'unsub_likes': self.unsub_likes,
            'unsub_dislikes': self.unsub_dislikes,
            'unsub_shares': self.unsub_shares,
        }


class Video(db.Model):
    __tablename__ = 'video'

    id = Column(Integer, primary_key=True, autoincrement=True)
    youtube_id = Column(String(128))
    channel_id = Column(Integer, ForeignKey('channel.id'))
    channel = relationship("Channel", back_populates="videos")
    create_date = Column(DateTime())
    title = Column(String(128))
    description = Column(Text())
    duration = Column(Integer)
    measurements = relationship(
        "VideoMeasurement", cascade="all,delete",
        back_populates="video", passive_deletes=True)


class Channel(db.Model):
    __tablename__ = 'channel'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128))
    videos = relationship("Video")


@app.route('/results', methods=['GET'])
def results():
    # Retrieve the latest video measurement for each video
    latest_measurements = (
        db.session.query(VideoMeasurement,
                         db.func.max(VideoMeasurement.measurement_date))
        .join(Video).join(Channel)
        .group_by(Channel.id, VideoMeasurement.video_id)
        .with_entities(VideoMeasurement,
                       Video.title, Channel.name).all())

    results = []

    for result in latest_measurements:
        if result:
            json_measurement = result[0].as_json()
            json_measurement['video_title'] = result[1]
            json_measurement['channel_name'] = result[2]
            results.append(json_measurement)

    return jsonify(results)


if __name__ == '__main__':
    app.run()
