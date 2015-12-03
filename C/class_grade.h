#include <stdio.h>
#include <string.h>
#include <math.h>
#include "mysql.h"


void gradeClass(MYSQL* server, char* class);

int isNumeric(char *str);

int rounded(double x);

char* getLetter(int g);

