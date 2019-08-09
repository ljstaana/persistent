/** 
 * PERSISTENT DATA UTILITY CLASS
 * (C) 2019 . LJ Sta. Ana
 * MIT-License
 */

/**
 * It is advisable to break down big objects to 
 * smaller objects when creating persistent data.
 * This wouldn't be a problem for small to medium
 * sized amount of data. 
 * 
 * Small : < 10 MB
 * Medium : ~ 10 MB - 100 MB (okay for consistent pushing/pulling)
 * Large : > 100MB (okay for non consistent pushing/pulling)
 * 
 * Use nested persistence to create a tree of persistent
 * objects or use PersistentRouter
 * 
 *  let mybigobj = {
 *      a: {...}, // ~10MB
 *      b: {...}, // ~10MB
 *      c: {...}  // ~100MB
 * }
 * 
 * E.g. RISKY USE
 * let persistent = new Persistent("mybigobj", mybigobj) 
 * 
 * E.g. PROPER USE 
 *      // merge small-medium contexts, it's okay to do quicksaving here
 *      let persistent_ab = new Persistent("mybigobj.ab", join(mybigobj.a, mybigobj.b))
 *      // separate large contexts, it's risky to do quicksaving here
 *      let persistent_c = new Persistent("mybigobj.c", mybigobj.c)
 * 
 */
class Persistent 
{
    constructor(reference, init_obj) {
        this.reference = reference
        this.state = {
            meta: {
                counts: {
                    save_count: 0,
                    load_count: 0,
                    init_count: 0,
                },
                init_state : {}
            },
            context : {

            }
        } 

        if(init_obj)
            this.init(init_obj)
    }
    
    _get_item(ref) {
        this.state.meta.counts.load_count++
        return localStorage.getItem(ref)
    }

    _set_item (ref, val) {
        this.state.meta.counts.save_count++
        return localStorage.setItem(ref, val)
    }

    // gets the state object from localstorage
    load () {
        let ref = this.reference
        let ref_obj = this._get_item(ref)
        this.state = JSON.parse(ref_obj)
        this.load_count++
        return this.state
    }

    // saves the state to localstorage
    save () {
        let ref = this.reference 
        let ref_str = JSON.stringify(this.state)
        console.log(ref_str)
        this._set_item(ref, ref_str)
        this.save_count++
        return ref_str
    }

    // initializes a state and saves it to the 
    // reference object in the localstorage
    // if is not yet there 
    init (state) {
        console.log(state)
        this.state.meta.init_count++
        this.state.context = state 
        this.state.meta.init_state =   
            JSON.parse(JSON.stringify(state))
        this.state.meta.counts.init_count++
        if(!this.is_published()) {
            this.save()
        } else {
            this.access_count++
        }
    }

    // check if there is already a reference object saved
    // in the localstorage
    is_published () {
        let ref = this.reference
        return (this._get_item(ref) ? true : false)
    }

    // operates on the local state object 
    // usage:
    //      let val = persistent.get((ctx) => { return cb.my_val })
    // shorthand 
    //      $get = persistent.$set
    //      let val = $get(ctx => ctx.my_var)
    get (cb) {
        return cb(this.state.context) 
    }

    // sets an item on the local state but does
    // not publish/push it
    // usage: 
    //      persistent.set(ctx => ctx.my_var = "new value")
    // shorthand: 
    //      $set(ctx => my_var = "new_value")
    set (cb) {
        return cb(this.state.context)
    }
    
    // shorthand for publish - push
    // the publish function saves to the local state
    // but not to the local state
    // usage: 
    //      persistent.push(ctx => my_var = "new_value")
    // shorhand
    //      $push(ctx => my_var = "new_val")
    //
    push (cb) {
        let ref_str = this._set_item(this.reference)
        let ref_obj = JSON.parse(ref_str)
        cb(ref_obj.context)
        let nref_str = JSON.stringify(ref_obj)
        this._set_item(this.reference, nref_str)
    }

    // pull data from published state - pull
    // the pull function retrieves from the published state 
    // but does not modify local state
    // usage: 
    //      persistent.pull(ctx => { return my_var })
    // shorthand: 
    //      $pull(ctx => ctx.my_var)
    pull (cb) {
        let ref_str = this._get_item(this.reference)
        let ref_obj = JSON.parse(ref_str)
        return cb(ref_obj.context)
    }

    // publishes data to the published state 
    // and also modified the local state
    publish (cb) {
        cb(this.state.context)
        this.save() 
    }

    // publishes and then 
    // retrieves data from the published state 
    // and then applies operations 
    retrieve (cb) {
        this.load()
        let val = cb(this.state.context)
        return val
    }

    
}