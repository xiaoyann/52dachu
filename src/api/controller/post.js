'use strict';
/**
 * rest controller
 * @type {Class}
 */
export default class extends think.controller.rest {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    super.init(http);
  }
  /**
   * before magic method
   * @return {Promise} []
   */
  __before(){
    
  }

  * getAction(http) {
    let data;
    if (this.id) {
      let pk = yield this.modelInstance.getPk();
      data = yield this.modelInstance.where({[pk]: this.id}).find();
      return this.success(data);
    }
    data = yield this.modelInstance.select();
    http.header('Access-Control-Allow-Origin', '*');
    return this.success(data);
  }
}