export default function wrapAsync(fn){
    return function(req, res, next){
        // fn(req, res, next).catch(
        //     (err) => {
        //         next(err);
        //     }
        // ) -- instead of this we can write
        fn(req, res, next).catch(next);
    }
}