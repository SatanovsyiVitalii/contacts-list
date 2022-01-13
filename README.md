The app was written with ```NestJS``` framework. Using ```MySQL``` database.

The app was deployed to Heroku.  
API Path = https://contacts-list-vitalii.herokuapp.com/  
Swagger Api Doc = https://contacts-list-vitalii.herokuapp.com/api/

For using app locally you need:

1. To install npm packages:

```npm install```

2. Run MySQL server on port ```3306```:

- [Guide how to set up MySQL server on MacOS/Linux](https://dev.mysql.com/doc/mysql-startstop-excerpt/8.0/en/binary-installation.html)

- [Guide how to set up MySQL server on Windows](https://dev.mysql.com/doc/mysql-startstop-excerpt/8.0/en/windows-server-first-start.html)

3. Create ```.env.stage.dev``` file in the root of the app folder.

Add follow content to the file. Values to env variables below presented as examples, you should pass values, which you specified on the step 2, during running DB server.

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=12345678
DB_DATABASE=contacts_list
```

4. Run the app:

```npm run start:dev```

The app provides REST api with following requests:

# GET /contacts - Get contacts

Queries:
- search (optional) - makes filtering by ```firstName```, ```lastName``` and ```number```
- sort (optional) - sorts the contacts list by ```firstName``` and ```lastName``` alpabeticly. Are possible two values - ```ASC``` (default), ```DESC```. Value passed to ```sort``` query applies to ```firstName``` and ```lastName``` simultaneously.
- favorite (optional) - allow to get only favorite or not favorite contacts. Accept two possible values - ```true``` and ```false```
### Response example:

```
[
    {
        "id": "b1f5c39f-944e-421e-a395-85f01cd212bb",
        "firstName": "Tom",
        "lastName": "Jerry",
        "phones": [
            {
                "id": "4113af6e-0227-48bb-a829-7544abb95ca8",
                "number": "+380991234567"
            }
        ]
    },
    {
        "id": "d839ede9-56b4-4557-8514-0447155eb004",
        "firstName": "Jhon",
        "lastName": "Smith",
        "phones": [
            {
                "id": "42ffd8a6-ee25-4101-ba4e-c0306ae20fad",
                "number": "+380931111333"
            }
        ]
    }
]
```
# POST /contacts - Create contact

### Payload:
```
Contact {
  "firstName": string;
  "lastName": string;
  "phones": Phone[];
}
```

```
Phone {
  "number": string;
}
```

```firstName - required```  
```lastName - required```  
```phones - required```  
```number - optional```

### Payload example:

```
{
    "firstName": "Tom",
    "lastName": "Jerry",
    "phones": [{ "number": "+380991234567" }]
}
```

### Response example:

```
{
    "id": "b1f5c39f-944e-421e-a395-85f01cd212bb",
    "firstName": "Tom",
    "lastName": "Jerry",
    "phones": [
        {
            "number": "+380991234567",
            "id": "4113af6e-0227-48bb-a829-7544abb95ca8"
        }
    ]
}
```

# PATCH /contacts/:id - Update contact with specific id

### Payload:
```
Contact {
  "firstName": string;
  "lastName": string;
  "phones": Phone[];
}
```

```
Phone {
  "number": string;
}
```

```firstName - optional```  
```lastName - optional```  
```phones - optional```  
```number - optional```

### Payload example:

```
{
    "firstName": "Tom",
    "lastName": "Jerry",
    "phones": [{ "number": "+380991234567" }]
}
```

### Response example:

```
{
    "id": "b1f5c39f-944e-421e-a395-85f01cd212bb",
    "firstName": "Tom",
    "lastName": "Jerry",
    "phones": [
        {
            "number": "+380991234567",
            "id": "4113af6e-0227-48bb-a829-7544abb95ca8"
        }
    ]
}
```

# DELETE /contacts/:id - Delete contact with specific id

