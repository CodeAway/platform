#!/bin/sh
echo "Compiling main..."
gcc -o main main.c
echo "Executing main..."
exec ./main
