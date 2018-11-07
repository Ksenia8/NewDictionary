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

    totalQuestionsElem.innerHTML = limitQuestions;

    // функция для показа слова, разбитого на буквы в кнопках
    let displayCurrentQuestion = () => {
    	let word = dictionary[currentQuestion];
    	let wordArr = word.split("");
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

    let saveStatistics = () => {
    	const req = new XMLHttpRequest();
    	req.open("POST", "http://localhost:5500/save?errors=" + totalErrors);
    	req.send();
    	req.onload = () => console.log("Успешно сохранена статистика на сервере!");
    	req.onerror = () => console.log("Ошибка при отправке запроса на сохранение");
	};

    // этот код лучше поместить в функцию
	// const req = new XMLHttpRequest();
    // req.open("GET", ".....?limit=" + limitQuestions);
    // req.send();
    // req.onload = () => {
	    // лучше всего использовать JSON
    	// dictionary = req.responseText;
    	// // в responseText должен быть список слов
    	// // код для запуска игры (в т.ч. для показа первого вопроса)
	// };

    displayCurrentQuestion();

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
            			alert("Всего ошибок: " + totalErrors);
                        saveStatistics();
					} else {
                        displayCurrentQuestion();
					}
				}
			} else {
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



