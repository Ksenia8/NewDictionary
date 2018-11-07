const express = require("express");
const fs = require("fs");
const app = express();
const port = 5500;
const statLocation = __dirname + "/errors-stat.txt";

let dictionary = [
    "apple", "word", "coffee", "green" , "red", "blue", "awesome", "amazing", "function", "artist", "singer", "black",
    "five", "for", "about", "what", "restaurant", "silence", "hotel", "luxury", "woman", "cat", "dog", "sister", "mother",
    "wallet", "pharmacy", "mountain", "box", "road", "interesting", "capital", "hope", "pain"
];

let shuffle = (array) => {
    array.forEach((value, index) => {
        // случайное число от 0 до индекса последнего элемента
        let rand = Math.floor(Math.random() * array.length);
        // вместо текущего элемента ставим случайны
        array[index] = array[rand];
        // а вместо случайного - текущий
        array[rand] = value;
    });
};

// указываем express, что в папке public есть файлы
// которые необходимо показывать, когда приходят запросы
// т.е. если будет запрос /index.html или /scripts.js
// то экспресс автоматически прочитает нужный файл и отправит ответ
app.use(express.static(__dirname + "/public/"));

// а дальше мы обратываем запросы на конкретные адреса
let totalErrors = parseInt(fs.readFileSync(statLocation));

app.post("/save", (req, res) => {
    // параметры из адресной строки типа вот этого ?errors=434234
    // доступны через req.query
    totalErrors += parseInt(req.query.errors);

    // запись в файл
    fs.writeFile(statLocation, totalErrors, (err) => {
        if (err) {
            console.log("Ошибка записи в файл!");
        }
    });

    // отправляем статус ответа 200 (без текста)
    res.sendStatus(200);
});

app.get("/stat", (req, res) => {
   // если в функцию res.send() передать число, то она считает, что это статус ответа
   // т.е. что-то типа 200, 404, 500 и т.д.
   // а если передать текст, то она считает, что код ответа 200, а этот текст надо отправить
   // клиенту
   res.send(totalErrors.toString());
});

//когда приходит запрос на адрес
//из словаря выбираем слова (limit передаем через адресную строку ?limit)
app.get("/getDictionary", (req,res)=> {
    let limit = req.query.limit;
    //запускаем сортировку массива
    shuffle(dictionary);

    //извлекаем кол-во слов = limit
    let part = dictionary.slice(0,limit);
    let randomLetters = [];

    for (let word of part){
        //перемешиваем символы
        let randWord = shuffle(word.split(""));

        //сохраняем в массив
        randomLetters.push(randWord);
    }
    // сформируем ответ сервера в виде объекта
    let dict = {
        answer: part, //сами слова
        question: randomLetters //слова с перемешанными буквами
    };

    //массив преобразуем в json и отправляем клиенту
    res.json(dict);
    //res.send(JSON.stringify(part));
});


app.listen(port, () => {
   console.log(`Сервер запущен на порту ${port}`) ;
});