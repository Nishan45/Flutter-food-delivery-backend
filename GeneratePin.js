function generatePin () {
    
    min = 1,
    max = 9999;
    return ("0" + (Math.floor(Math.random() * (max - min + 1)) + min)).slice(-4);
}

module.exports={
    generatePin:generatePin
}