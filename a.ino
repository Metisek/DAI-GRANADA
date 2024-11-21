#include <TimerOne.h> // Biblioteka TimerOne
#include <Arduino.h>

// ** Definicje pinów **
#define CHA 2 // Kanał A enkodera, podłączony do pinu 2
#define CHB 3 // Kanał B enkodera, podłączony do pinu 3
#define PWM_MOTOR 9 // Wyjście PWM dla silnika
#define AIN1 11 // Kierunek obrotów (mostek H)
#define AIN2 10 // Kierunek obrotów (mostek H)

// ** Zmienne globalne **
volatile int pulses = 0; // Licznik impulsów enkodera

// Parametry PID
volatile float Kp = 1.18; // Wzmocnienie proporcjonalne PID
volatile float Ki = 0;    // Wzmocnienie całkujące PID
volatile float Kd = 0.03; // Wzmocnienie różniczkujące PID

volatile float Pn = 0;   // Wyjście PID dla bieżącej próbki
volatile float En = 0;   // Błąd dla bieżącej próbki
volatile float Pn1 = 0;  // Wyjście PID dla poprzedniej próbki (n-1)
volatile float En1 = 0;  // Błąd dla próbki n-1
volatile float En2 = 0;  // Błąd dla próbki n-2

volatile float q0 = 0;
volatile float q1 = 0;
volatile float q2 = 0;

const float Tm = 0.01;     // Okres próbkowania w sekundach
const float consigna = 2 * PI; // Wartość zadana (2π radianów = 1 obrót)
volatile float angulo = 0; // Aktualny kąt (obliczany z impulsów enkodera)

void setup() {
    // Konfiguracja pinów enkodera
    pinMode(CHA, INPUT_PULLUP);
    pinMode(CHB, INPUT_PULLUP);

    // Przerwania dla enkodera
    attachInterrupt(digitalPinToInterrupt(CHA), Encoder_CHA, CHANGE); // Przerwanie dla kanału A
    attachInterrupt(digitalPinToInterrupt(CHB), Encoder_CHB, CHANGE); // Przerwanie dla kanału B

    // Konfiguracja wyjścia PWM
    pinMode(PWM_MOTOR, OUTPUT);
    pinMode(AIN1, OUTPUT);
    pinMode(AIN2, OUTPUT);

    // Port szeregowy do monitorowania
    Serial.begin(115200);

    // Ustawienia współczynników PID
    q0 = Kp + (Ki * Tm) / 2 + Kd / Tm;
    q1 = -Kp + (Ki * Tm) / 2 - (2 * Kd) / Tm;
    q2 = Kd / Tm;

    // Konfiguracja TimerOne dla przerwań co 10 ms
    Timer1.initialize(10000); // 10 ms = 10 000 mikrosekund
    Timer1.attachInterrupt(control); // Funkcja wywoływana w przerwaniu
    Timer1.start(); // Uruchomienie przerwań
}

void loop() {
    // Monitorowanie impulsów i kąta na porcie szeregowym
    Serial.print("Impulsy: ");
    Serial.print(pulses);
    Serial.print(", Kąt [rad]: ");
    Serial.print(angulo);
    Serial.print(", Kąt [stopnie]: ");
    Serial.println(angulo * 180 / PI);

    delay(20); // Ograniczenie częstotliwości wysyłania danych
}

void control() {
    // Przeliczenie impulsów enkodera na kąt w radianach
    angulo = pulses * (2 * PI / 1040); // Zakładamy enkoder z 1040 impulsami na obrót

    // Obliczenie błędu (wartość zadana - aktualny kąt)
    En = consigna - angulo;

    // Obliczenie wyjścia PID (równanie rekurencyjne)
    Pn = Pn1 + q0 * En + q1 * En1 + q2 * En2;

    // Ograniczenie wyjścia PID do zakresu od -8,5 do 8,5 V
    if (Pn > 8.5) Pn = 8.5;
    if (Pn < -8.5) Pn = -8.5;

    // Generowanie sygnału PWM i konfiguracja kierunku
    int valorPWM = abs(int(Pn * 30)); // Skala 8,5 V -> 255 dla PWM
    if (valorPWM > 255) valorPWM = 255; // Ograniczenie do zakresu 0–255
    analogWrite(PWM_MOTOR, valorPWM); // Wyjście PWM na pin PWM_MOTOR

    // Ustawienie kierunku obrotów w zależności od znaku wyjścia PID
    if (Pn > 0) {
        digitalWrite(AIN1, LOW);  // Kierunek obrotu
        digitalWrite(AIN2, HIGH);
    } else {
        digitalWrite(AIN1, HIGH); // Odwrotny kierunek obrotu
        digitalWrite(AIN2, LOW);
    }

    // Aktualizacja wartości dla kolejnych próbek
    En2 = En1;
    En1 = En;
    Pn1 = Pn;
}

// Przerwanie dla kanału A enkodera
void Encoder_CHA() {
    if (digitalRead(CHA) == digitalRead(CHB)) pulses--;
    else pulses++;
}

// Przerwanie dla kanału B enkodera
void Encoder_CHB() {
    if (digitalRead(CHA) != digitalRead(CHB)) pulses--;
    else pulses++;
}
