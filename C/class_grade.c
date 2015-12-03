//compile with gcc class_grade.c -I [location of mysql include files] -lmysqlclient
//
//arguments are: courseid username password port
#include "class_grade.h"

int main(int argc, char* argv[]){
	if(argc != 5 || !isNumeric(argv[4])){
		puts("failure: invalid_argument");
		return 1;
	}
	MYSQL* server = mysql_init(NULL);
	//MYSQL* connect = mysql_real_connect(server, "localhost", (argv[2]), (argv[3]), "phiclicker", (argv[4]), NULL, 0);
	MYSQL* connect = mysql_real_connect(server, "liquidtungsten.us", (argv[2]), (argv[3]), "phiclicker", atoi(argv[4]), NULL, 0);
	if(connect == NULL){puts("failure: connection_failed"); return 1;}//connect is used only for this test
	//else puts("connection to server sucessful");
	
	
	gradeClass(server, argv[1]);
	
	
	mysql_close(server);//free connection memory, close connection
	mysql_library_end();
	return 0;
}

void gradeClass(MYSQL* server, char* class){
	if(!class || !isNumeric(class)){//check for valid input, prevents injection here
		puts("failure: invalid_argument");
		return;
	}
	double conv = 0;//used for conversions
	//puts("reached 1\n");
	char* query = calloc(sizeof(char), 350);
	if(query == NULL){puts("failure: no_memory"); return;}
	int temp = snprintf(query, 350, "SELECT UserUsername, value, correctAnswer, (SELECT COUNT(id) FROM Questions WHERE CourseId = %s AND correctAnswer IS NOT NULL) FROM Responses JOIN Questions WHERE QuestionID = Questions.id AND QuestionId IN (SELECT id FROM Questions WHERE CourseId = %s AND correctAnswer IS NOT NULL) ORDER BY UserUsername", class, class);
	if(temp<0||temp>=350){puts("failure: invalid_argument"); return;}//check for write sucess
	mysql_query(server, query);
	MYSQL_RES* result = mysql_store_result(server);//fetch result, (allocates space)
	//puts("reached 2\n");
	char* user = calloc(sizeof(char), 260);//current user
	if(user == NULL){puts("failure: no_memory"); return;}
	int correct = 0;//correct counter
	int questions = 0;
	MYSQL_ROW work = mysql_fetch_row(result);//current row
	if(work != NULL){
		strcpy(user, work[0]);//first user made current to avoid processing null
		questions = atoi(work[3]);//stored for last write, total questions asked
	}
	//puts("reached 3\n");
	while(work != NULL){
		if(strcmp(user, work[0])){//next user check
			conv = ((double)correct/(double)questions)*100.0;
			printf("%s: %i\%, %s\n", user, rounded(conv), getLetter(rounded(conv)));//print percentage for finished user
			correct = 0;//reset count
			strcpy(user, work[0]);//change current user
		}
		if(!strcmp((char*)work[1], (char*)work[2])) correct++;//anwser is correct
		
		work = mysql_fetch_row(result);//fetch next row
	}
	
	
	if(*user){
		conv = ((double)correct/(double)questions)*100.0;
		printf("%s: %i\%, %s\n", user, rounded(conv), getLetter(rounded(conv)));//print last user, if any
	}
	else correct = 1337;
	//puts("reached 4\n");
	
	mysql_free_result(result);//free results for reuse
	

	temp = snprintf(query, 350, "select UserUsername from Registrations where CourseId = %s and UserUsername NOT IN (select UserUsername from Responses where QuestionId in (select id from Questions where CourseId = %s and correctAnswer IS NOT NULL))", class, class);//find users with no answers
	if(temp<0||temp>=350){puts("failure: invalid_argument"); return;}//check for write sucess
	mysql_query(server, query);
	result = mysql_store_result(server);//fetch result, (allocates space)
	work = mysql_fetch_row(result);//fetch next row	

	while(work != NULL){
		printf("%s, 0\%, F\n", work[0]);
		strcpy(user, work[0]);//change current user
		work = mysql_fetch_row(result);//fetch next row
	}
	
	if(!*user && correct == 1337) puts("No grades have been taken.");
	
	mysql_free_result(result);//free results
	free(user);//free workspace
	free(query);
}

int isNumeric(char *str){
  while(*str){
    if(!isdigit(*str))
      return 0;
    str++;
  }

  return 1;
}

int rounded(double d){
return (d - (int)(d) > 0.5) ? (int)(d)+1 : (int)d;
}

char* getLetter(int g){
	if(g>=90) return "A";
	if(g>=80) return "B";
	if(g>=70) return "C";
	if(g>=60) return "D";
	return "F";
}
