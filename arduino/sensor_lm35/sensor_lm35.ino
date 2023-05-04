int lm35_pin = A0, leitura_lm35 = 0;
float temperatura;

void setup()
{
Serial.begin(9600);

}
void loop()
{

leitura_lm35 = analogRead(lm35_pin);
temperatura = leitura_lm35 * (5.0/1023) * 100;
Serial.print(temperatura);
Serial.println(";");

delay(2000);
}