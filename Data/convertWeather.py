# Jonathan Petersen, John Humble
# CS 5890 - Data Visualization
# Weather Averaging Script

import json

def processWeather(time, offset):
    timeString = f'{time:04}'
    offsetString = f'{offset:03}'

    infile = open(f'clouds/clouds_{timeString}_{offsetString}.json')
    clouds = json.load(infile)

    numAltitudes = len(clouds)
    numPoints = len(clouds[0]['data'])

    averages = [0] * numPoints
    for i in range(numAltitudes):
        for j in range(numPoints):
            averages[j] += clouds[i]['data'][j]

    for i in range(numPoints):
        averages[i] /= numAltitudes
        averages[i] = int(averages[i])

    outfile = open(f'clouds-processed/clouds_{timeString}_{offsetString}.json', 'w')
    json.dump(averages, outfile, separators=(',', ':'))

times = [0, 600, 1200, 1800]
offsets = [i * 3 for i in range(int(387 / 3))]

for t in times:
    for o in offsets:
        processWeather(t, o)
