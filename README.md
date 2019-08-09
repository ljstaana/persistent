# Persistent

A simple utility class for working with in-browser localStorage object.

Usage: 

## Initialization
To initialize a Persistent object. Use the following code: 

```js 
    
    let store = new Persistent("my_obj")
    store.init({
        my_var_a : "old_val_a",
        my_var_b : "old_val_b"
    })
    
    // or
    
    let store = new Persistent("my_obj", {
        my_var_a : "old val a",
        my_var_b : "old_val_b"
    }) 
    
```

## Meta and Context
The Persistent state's state object can be accessed using: 

```js
    console.log(store.state) // returns "{ meta: {...}, context: {...} }"
```
The meta object contains 2 simple objects:

1. The counts for the: 
    1. **save_count** - no.of times the state object of `store` has been saved to the localStorage
    2. **load_count** - no. of times the state object of `store` Persistent object has been loaded from the localStorage
    3. **init_count** 