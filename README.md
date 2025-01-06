1. Common Requirements
1.1. Architecture
1.1.1. Micro-services as AWS Lamda functions on Java, Nodejs application as a
back-end server, React application as front-end server.
1.2. Errors Handling an Logging
1.2.1. An application should have logging with appropriate logging levels
1.2.2. Exceptions related to malfunctioning of the application core
Microservices should be configured in CloudWatch as alarms with following
sending mails/SMS to the appropriate technical stuff
1.2.3. Exceptions related to wrong data (data inconsistency should be logged
with serious/error logging level
1.2.4. An application should allow the front-end user to see a dashboard with
all alarms and data exceptions
1.2.4.1. Consider using polling approach
1.2.4.1.1. Scheduled lambda function accesses CloudWatch for
exceptions and populates external non AWS Database with the
errors
1.2.4.1.2. React front-end application periodically polls Nodejs for
errors and Nodejs accesses the external Database from previous
item

1.3. Security Management
1.3.1. Nodejs should apply AAA security
1.3.1.1. Authentication
1.3.1.1.1. JWT
1.3.1.2. Authorization
1.3.1.2.1. Role based
1.3.1.3. Accounting
1.3.1.3.1. On your consideration. AWS Identity center would be best
but it’s not easy; proprietary as we have done at course would be
much simplest but worse than existing third party ones

1.3.2. React
1.3.2.1. Best – applying AuthNext v5 but it may take much time to get
known of it

1.3.2.2. Login page
1.3.2.2.1. Each new session should begin with Login page
1.3.2.2.2. In the case of JWT token expiration login page should
appear automatically

1.3.2.3. The application should allow the user to use only pages according
to authorization role
1.3.2.4. JWT placeholder after login performed
1.3.2.4.1. The best – HTTP Only Cookies sent by the back-end server
1.3.2.4.2. Acceptable – session storage (not local storage)

1.4. Configuration
1.4.1. AWS configuration properties
1.4.1.1. Environment variables
1.4.1.1.1. The best to use AWS secret for saving all sensitive
credentials
1.4.1.1.2. Acceptable – regular environment variables
1.4.2. React
1.4.2.1. Environment variables
1.4.3. Nodejs
1.4.3.1. Config NPM package with default.json and production.json
environment variable names
1.4.3.2. Environment variables values
1.5. Deployment
1.5.1. AWS Services
1.5.1.1. CloudFormation
1.5.1.2. SAM
1.5.2. Back-Office
1.5.2.1. Front-End
1.5.2.1.1. S3 &amp; Rout 53
1.5.2.2. Back-End
1.5.2.2.1. On your consideration, for example ECS /
Fargate


2. Computerized Storehouse
2.1. Marketing Requirements:
2.1.1. The application should allow the automatic creation of the product
orders in accordance with a state of a storehouse spot
2.1.2. The application should allow the detection of the products lack for each
spot
2.1.3. The application should provide the exact spot coordinates according to a
given order number
2.2. Software Requirements
2.2.1. The application should have a container data imitator that periodically
sends random data to UDP service running under ECS /Fargate
2.2.1.1. The UDP service should send the container data to an AWS Data
Stream (DS)
2.2.1.2. The container data should contain the spot coordinates and
quantity in the product units (weight, count, bottles, boxes, etc.)
2.2.2. The application should have a Lambda function taking the data from the
DS of 3.2.1.1
2.2.2.1. The function should allow recognition of the products lack in the
container
2.2.2.1.1. The data about each container should be kept in DB
2.2.2.1.2. If the quantity is less than configurable threshold value
(default: 50%) the function should send in another DS the data
containing the spot coordinates, the product name and required
quantity)

2.2.3. The application should have a Lambda function taking the data from the
DS of 3.2.2.1.2
2.2.3.1. The function should create order record and send the order
record to another DS

2.2.4. The application should have a Lambda function taking the data from the
DS of 3.2.1.1
2.2.4.1. The function should allow recognition of the orders closing
2.2.4.2. If the quantity is more than threshold value (default: 50%) and
there is open order for the application the function sends data of
order closing to another DS

2.2.5. The back-office service should allow performing the following requests
2.2.5.1. Getting data about any container
2.2.5.2. Getting data about the orders
2.2.5.3. Statistics

2.2.5.4. Closing order
2.2.5.5. Creating order




Общие Требования

1.1. Архитектура
1.1.1. Микросервисы как функции AWS Lambda на Java, Node.js приложение как сервер обратного конца, React приложение как сервер фронтального конца.

1.2. Обработка ошибок и логирование
1.2.1. Приложение должно иметь логирование с использованием соответствующих уровней логирования.
1.2.2. Исключения, связанные с неисправностями ядра приложения, должны быть настроены в CloudWatch как тревоги с последующей отправкой писем/SMS соответствующему техническому персоналу.
1.2.3. Исключения, связанные с некорректными данными (несогласованность данных), должны логироваться с уровнем серьезности/ошибки.
1.2.4. Приложение должно предоставлять пользователю фронтального конца панель мониторинга со всеми тревогами и исключениями данных.

1.2.4.1. Рассмотреть использование подхода с опросом.
1.2.4.1.1. Запланированная функция Lambda получает доступ к CloudWatch для исключений и заполняет внешнюю базу данных (не AWS) ошибками.
1.2.4.1.2. React приложение фронтального конца периодически опрашивает Node.js для получения ошибок, а Node.js получает данные из внешней базы данных.
1.3. Управление безопасностью
1.3.1. Node.js должен обеспечивать безопасность по принципу AAA (аутентификация, авторизация, аудит):

1.3.1.1. Аутентификация
1.3.1.1.1. JWT
1.3.1.2. Авторизация
1.3.1.2.1. Ролевая модель
1.3.1.3. Аудит
1.3.1.3.1. На ваше усмотрение. AWS Identity Center подходит лучше всего, но сложен; использование собственного решения, как в курсе, проще, но хуже сторонних решений.
1.3.2. React

1.3.2.1. Лучший вариант – использование AuthNext v5, но его освоение займет много времени.
1.3.2.2. Страница входа
1.3.2.2.1. Каждая новая сессия должна начинаться со страницы входа.
1.3.2.2.2. В случае истечения срока действия JWT токена страница входа должна появляться автоматически.
1.3.2.3. Приложение должно позволять пользователю использовать только те страницы, которые соответствуют его роли авторизации.
1.3.2.4. Хранение JWT после входа:
1.3.2.4.1. Лучший вариант – HTTP Only Cookies, отправляемые сервером обратного конца.
1.3.2.4.2. Допустимый вариант – session storage (не local storage).
1.4. Конфигурация
1.4.1. Свойства конфигурации AWS

1.4.1.1. Переменные окружения:
1.4.1.1.1. Лучше всего использовать AWS Secrets для хранения всех конфиденциальных данных.
1.4.1.1.2. Допустимо – обычные переменные окружения.
1.4.2. React
1.4.2.1. Переменные окружения
1.4.3. Node.js
1.4.3.1. Использование NPM пакета Config с default.json и production.json для имен переменных окружения.
1.4.3.2. Значения переменных окружения.
1.5. Деплой
1.5.1. AWS сервисы:

1.5.1.1. CloudFormation
1.5.1.2. SAM
1.5.2. Back-Office
1.5.2.1. Фронт-энд
1.5.2.1.1. S3 и Route 53
1.5.2.2. Бэк-энд
1.5.2.2.1. На ваше усмотрение, например ECS / Fargate
2. Компьютеризированный склад

2.1. Маркетинговые требования
2.1.1. Приложение должно автоматически создавать заказы на товары в зависимости от состояния складских мест.
2.1.2. Приложение должно определять нехватку товаров для каждого места.
2.1.3. Приложение должно предоставлять точные координаты места в соответствии с номером заказа.

2.2. Программные требования
2.2.1. Приложение должно содержать эмулятор данных контейнера, который периодически отправляет случайные данные в службу UDP, работающую в ECS / Fargate.

2.2.1.1. UDP служба должна отправлять данные контейнера в AWS Data Stream (DS).
2.2.1.2. Данные контейнера должны содержать координаты места и количество товарных единиц (вес, количество, бутылки, коробки и т.д.).
2.2.2. Приложение должно содержать функцию Lambda, получающую данные из DS из 3.2.1.1.

2.2.2.1. Функция должна определять нехватку товаров в контейнере.
2.2.2.1.1. Данные о каждом контейнере должны храниться в базе данных.
2.2.2.1.2. Если количество меньше порогового значения (по умолчанию: 50%), функция должна отправлять в другой DS данные с координатами места, названием товара и необходимым количеством.
2.2.3. Приложение должно содержать функцию Lambda, получающую данные из DS из 3.2.2.1.2.

2.2.3.1. Функция должна создавать запись заказа и отправлять ее в другой DS.
2.2.4. Приложение должно содержать функцию Lambda, получающую данные из DS из 3.2.1.1.

2.2.4.1. Функция должна определять закрытие заказов.
2.2.4.2. Если количество превышает пороговое значение (по умолчанию: 50%) и заказ остается открытым, функция должна отправлять данные о закрытии заказа в другой DS.
2.2.5. Сервис Back-Office должен позволять выполнять следующие запросы:

2.2.5.1. Получение данных о любом контейнере.
2.2.5.2. Получение данных о заказах.
2.2.5.3. Статистика.
2.2.5.4. Закрытие заказа.
2.2.5.5. Создание заказа.