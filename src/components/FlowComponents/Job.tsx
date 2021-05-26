import Base from './Base';
class Job extends Base {
  static readonly MetaData = {
    ...Base.MetaData,
    width: 229,
    height: 99,
    radius: 10,
  };

  getMetaData() {
    return Job.MetaData;
  }
}
export default Job