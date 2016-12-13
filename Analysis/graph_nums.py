import matplotlib.pyplot as plt
import numpy as np

for filenum in range(5):
    fin = open('scores_over_time{}.txt'.format(filenum),'r')

    scores = []
    for line in fin:
        scores.append(line)

    font = {'size'   : 22}

    plt.rc('font', **font)

    plt.figure(1, figsize = (14,9))
    plt.title("HBDT16: Cost of State vs Steps")
    plt.xlabel("Steps of Local Search")
    plt.ylabel("Cost of Current State")
    plt.plot(scores)
plt.savefig("HBDT16_cost_vs_time.png")