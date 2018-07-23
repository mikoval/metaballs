static double sum, sum2 = 0;
	static double mc = 0;
	
	public static double escapedValue(int n, Complex z, double bail, Complex p) {
	
		double temp = p.norm_squared();
		double temp2 = z.norm_squared();
	
		temp += 0.000000001;
		temp = Math.log(temp);
	
		double f = 1 - (Math.log(bail * bail) - temp) / (Math.log(temp2) - temp);
	
		if(n < 2)
			return f;
	
		sum = sum / n;
		sum2 = sum2 / (n - 1);
	
		return sum + (sum2 - sum) * f;
	}
	
	//n : iteration
	public static Complex iteratedFunction(Complex z, Complex c, int n) {
	
		Complex temp = z.square();
		Complex temp2 = temp.plus(c);
	
		if(n == 0) {
			mc = c.norm();
		}
	
		sum2 = sum;
		if(n != 0) {
			double mp = temp.norm();
			double m = Math.abs(mp - mc);
			double M = mp + mc;
			
			sum += (temp2.norm() - m) / (M - m);
		}
	
		return temp2;
	
	}
	
	
	public static double iterate(Complex c) {
	
		Complex z = new Complex();
		Complex p = new Complex(); //previous value
		int maxIter = 300;
		double bailout = 16;
		
		for(int i = 0; i < maxIter; i++) {
			if(z.norm() >= bailout) {
				return escapedValue(i, z, bailout, p); // used the returned value to select a color from a palette
			}
			
			p.assign(z);
			z = iteratedFunction(z, c, i);
		}
		
		return maxIter;
	
	}