"use strict";

//shuffle(dictionary);

window.addEventListener("load", function () {
    const limitQuestions = 3;
    let currentQuestion = 0;
    let currentLetter = 0;
    let currentQuestionErrors = 0;
    let totalErrors = 0;

    let answerContainer = document.querySelector("#answer");
    let letters = document.querySelector("#letters");
    let currentQuestionElem = document.querySelector("#current_question");
    let totalQuestionsElem = document.querySelector("#total_questions");
    let getErrorsBtn = document.querySelector("#getErrors");

    let currentErrorElem = document.querySelector("#current_error");
    let totalError = document.querySelector("#total_error")

    //тут будут слова с буквами в правильном порядке
    let dictionary = [];
    // а тут с перемешанными буквами
    let randDictionary = [];

    totalQuestionsElem.innerHTML = limitQuestions;


    // функция для показа слова, разбитого на буквы в кнопках
    let displayCurrentQuestion = () => {

        let word = dictionary[currentQuestion];
    	let wordArr = randDictionary[currentQuestion];
        //shuffle(wordArr);
        currentQuestionErrors = 0;

        for (let letter of wordArr) {
        	let btn = document.createElement("button");
        	btn.innerHTML = letter;
        	btn.className = "btn btn-primary btn-sm mr-1";

            letters.appendChild(btn);
		}

        currentQuestionElem.innerHTML = currentQuestion + 1;
        answerContainer.innerHTML = "";
	};

    //функция запрашивает словарь на сервере и вызывает отображение первого вопроса
    let startTest = () => {
        //ЗАПРОС СЛОВАРЯ
        //отправка запроса
        //создаем объект и указываем адрес с которого хотим получить ответ
        let req = new XMLHttpRequest();
        req.open("GET", "http://localhost:5500/getDictionary?limit="+limitQuestions);
        //отправляем запрос на сервер
        req.send();

        //ждем пока загрузит ответ
        req.onload = function(){
            //2. Когда словарь загружен
            //проверяем код ответа
            if (req.status === 200) {
                // Сохраняем словарь в переменнsые
                //заполняем словами, которые пришли с сервера
                //раскодируем данные в формате JSON
                let dict = JSON.parse(req.responseText);

                dictionary = dict.answer;
                randDictionary = dict.question;

                console.log(dictionary);
                console.log(randDictionary);

                // 3. Показ первого вопроса
                // вызов отображения первого вопроса
                displayCurrentQuestion();
            }
        };
    };

    let saveStatistics = ()=> {
    	const req = new XMLHttpRequest();
    	req.open("POST", "http://localhost:5500/save?errors=" + totalErrors);
    	req.send();
    	req.onload = () => console.log("Успешно сохранена статистика на сервере!");
    	req.onerror = () => console.log("Ошибка при отправке запроса на сохранение");
	};

    // 1. сначала запросим словарь на сервере
    startTest();

    letters.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            let btn = event.target;
            let word = dictionary[currentQuestion];

            // если текст на кнопке совпадает с буквой (текущей) в текущем слове
            if (btn.innerHTML === word[currentLetter]) {
            	btn.classList.remove("btn-primary");
            	btn.classList.add("btn-success");
            	answerContainer.appendChild(btn);

            	// если выбрали правильную букву, то теперь ждём следующую
            	currentLetter++;

            	// если дошли до последней буквы, то переходим к следующему заданию
            	if (currentLetter >= word.length) {
            		currentLetter = 0;
            		currentQuestion++;

            		// если мы дошли до последнего вопроса
            		if (currentQuestion >= limitQuestions) {
            			letters.innerHTML = "<div class='alert alert-success'>Вы успешно справились со всеми заданиями!</div>";

            			// alert("Всего ошибок: " + totalErrors);
                        saveStatistics();
					} else {
                        displayCurrentQuestion();
					}
				}
			} else {

                currentErrorElem.innerHTML = currentQuestionErrors+1;
                totalError.innerHTML = totalErrors+1;


                currentQuestionErrors++;
            	totalErrors++;

                btn.classList.remove("btn-primary");
                btn.classList.add("btn-danger");

                setTimeout(() => {
                	btn.classList.remove("btn-danger");
                    btn.classList.add("btn-primary");
                }, 300);
			}
        }
    });

    getErrorsBtn.addEventListener("click", function () {
    	const req = new XMLHttpRequest();
    	req.open("GET", "http://localhost:5500/stat");

    	req.onload = () => {
    		if (req.status === 200) {
                alert("Всего ошибок у всех пользователей: " + req.responseText);
			} else {
    			alert("Не удалось получить статистику!");
			}
		};

    	req.send();
	});
});



