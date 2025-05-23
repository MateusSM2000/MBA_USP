import random

numero_secreto = random.randint(1, 10)
tentativas = 0

while True:
    tentativa = int(input("Adivinhe o número entre 1 e 10: "))
    tentativas += 1

    if tentativa == numero_secreto:
        print(f"Parabéns! Você acertou em {tentativas} tentativas.")
        break
    elif tentativa < numero_secreto:
        print("Tente um número maior.")
    else:
        print("Tente um número menor.")
