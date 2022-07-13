import warnings

warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import seaborn as sns
import datetime as dt


def prepare_data():
	data = pd.read_csv('datapoints.csv', header=0)	
	data['Time'] = pd.to_datetime(data['Time'],format="%Y-%m-%dT%H:%M:%S.%f").dt.tz_convert(tz='EET')
	resampled = data.resample('H',on='Time').mean()
	actual_data = resampled.copy()
	#cleaning outliers
	resampled['pwrA'].loc[(resampled['pwrA']>595)] = 595
	resampled['pwrA'].loc[(resampled['pwrA']<525)] = 525
	resampled['pwrB'].loc[(resampled['pwrB']>680)] = 680
	resampled['pwrB'].loc[(resampled['pwrB']<210)] = 210
	lower_limit = resampled['pwrC'].quantile(0.001)
	upper_limit = resampled['pwrC'].quantile(0.92)
	resampled['pwrC'] = resampled['pwrC'].clip(lower=lower_limit,upper=upper_limit)
	#log data
	resampled['log_pwrA'] = np.log(resampled['pwrA'])
	resampled['log_pwrB'] = np.log(resampled['pwrB'])
	resampled['log_pwrC'] = np.log(resampled['pwrC'])
	#differencing data
	resampled['diff_log_pwrA'] = resampled['log_pwrA'].diff()
	resampled['diff_log_pwrB'] = resampled['log_pwrB'].diff()
	resampled['diff_log_pwrC'] = resampled['log_pwrC'].diff()
	#store results
	resampled.to_csv('complete_data_utc.csv')
	actual_data.to_csv('actual_data_utc.csv')
	return (resampled, actual_data)
