-- FUNCTION: public.GetPortfolioRealValueForDateById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioRealValueForDateById(integer, date);

CREATE OR REPLACE FUNCTION public.GetPortfolioRealValueForDateById
(
    s_portfolioid INTEGER,
    s_date DATE
)
RETURNS TABLE (
    ticker VARCHAR(8),
    value NUMERIC
)
AS
$$
BEGIN
	DROP TABLE IF EXISTS StockQuantity;
	CREATE TEMP TABLE StockQuantity (
    	ticker VARCHAR(8),
    	quantity BIGINT
    );

	INSERT INTO StockQuantity (ticker, quantity)
    SELECT
        T.ticker,
        Sum(T.quantity)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND date(T.datetime) <= s_date
    GROUP BY T.ticker;


    DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        ticker VARCHAR(8),
        value NUMERIC
    );

    INSERT INTO OutputTable (ticker, value)
    SELECT
    	SQ.ticker,
        SUM(SQ.quantity * SD.close)
    FROM StockQuantity AS SQ
    LEFT OUTER JOIN stock_daily AS SD ON SQ.ticker = SD.ticker
    WHERE SD.datetime = ( SELECT MAX(datetime) 
                            FROM stock_daily AS SD2 
                           WHERE SD2.ticker = SD.ticker 
                             AND date(SD2.datetime) <= s_date)
    GROUP BY SQ.ticker;
    
    INSERT INTO OutputTable (ticker, value)
    SELECT
        T.ticker,
        Sum(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker = 'RESERVE'
      AND date(T.datetime) <= s_date
    GROUP BY T.ticker;

    RETURN QUERY
    SELECT *
    FROM OutputTable;
    
END;
$$

LANGUAGE 'plpgsql'