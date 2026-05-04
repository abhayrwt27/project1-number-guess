import random

play=input("Press y/Y to play Number Guessing Game: ")
#using while loop to run code until user inputs other than y/Y
while (play=="y" or play=="Y"):
    #taking a number between 1-100 which user has to guess
    num=random.randint(1,100)  
    attempt=0

    while True:
        #taking input from user
        guess = int(input("Enter a number between 1-100:"))
        attempt+=1 #counting the attempts of user

        if guess > num:     #if guess is high
            print("Too High") 
        elif guess < num:   #if guess is low
            print("Too Low")
        else:       #user has guessed correct
            print("CORRECT! You have guessed the number in", attempt, "attempts")
            break   #to stop the further execution of loop
    
    #taking input to check if whether the user wants to play again or not 
    play=input(("Press y/Y to play again: "))