import Base from './Base';
class Event extends Base {
  static readonly MetaData = {
    ...Base.MetaData,
    width: 119,
    height: 59,
    radius: 10
  };

  getMetaData() {
    return Event.MetaData;
  }
}
export default Event